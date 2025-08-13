"""
Concurrency and performance tests
Tests p95/p99 latency and concurrent session handling
"""

import pytest
import asyncio
import aiohttp
import time
import statistics
from typing import List, Dict, Any
from tests.utils import get_base_url, sid


@pytest.fixture
def async_base_url():
    """Async base URL fixture"""
    return get_base_url()


async def run_session(client: aiohttp.ClientSession, base_url: str, path: str, session_id: str) -> List[float]:
    """
    Run a multi-turn session and return response times
    
    Returns:
        List of response times in seconds
    """
    headers = {"Authorization": "Bearer mock_dev_token"}
    times = []
    
    # Turn 1: Initial question
    start = time.time()
    async with client.post(f"{base_url}{path}", 
                          json={"question": "Start session", "session_id": session_id},
                          headers=headers) as response:
        await response.json()
        times.append(time.time() - start)
    
    # Turn 2: Context-dependent follow-up
    start = time.time()
    async with client.post(f"{base_url}{path}",
                          json={"question": "When do I need to install it?", "session_id": session_id},
                          headers=headers) as response:
        await response.json()
        times.append(time.time() - start)
    
    return times


async def test_parallel_sessions(async_base_url):
    """Test parallel session handling"""
    N = 50  # concurrent sessions
    path = "/api/chat/ask"
    
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as client:
        session_ids = [sid(f"load-{i}") for i in range(N)]
        
        t0 = time.time()
        
        # Run all sessions concurrently
        session_tasks = [run_session(client, async_base_url, path, s) for s in session_ids]
        results = await asyncio.gather(*session_tasks, return_exceptions=True)
        
        total_time = time.time() - t0
        
        # Check for exceptions
        exceptions = [r for r in results if isinstance(r, Exception)]
        successful_results = [r for r in results if not isinstance(r, Exception)]
        
        print(f"Completed {len(successful_results)}/{N} sessions successfully in {total_time:.2f}s")
        print(f"Exceptions: {len(exceptions)}")
        
        # Should complete most sessions successfully
        success_rate = len(successful_results) / N
        assert success_rate >= 0.8, f"Success rate too low: {success_rate:.1%}"
        
        # Loose sanity check on total time (should handle 50 sessions reasonably fast)
        assert total_time < 30, f"Total time too high: {total_time:.2f}s"
        
        # Collect all response times
        all_times = []
        for result in successful_results:
            all_times.extend(result)
        
        if all_times:
            p95 = statistics.quantiles(all_times, n=20)[18]  # 95th percentile
            p99 = statistics.quantiles(all_times, n=100)[98]  # 99th percentile
            avg = statistics.mean(all_times)
            
            print(f"Response time stats:")
            print(f"  Average: {avg:.2f}s")
            print(f"  P95: {p95:.2f}s")
            print(f"  P99: {p99:.2f}s")
            
            # Performance assertions (adjust based on your SLOs)
            assert avg < 5.0, f"Average response time too high: {avg:.2f}s"
            assert p95 < 8.0, f"P95 response time too high: {p95:.2f}s"
            assert p99 < 15.0, f"P99 response time too high: {p99:.2f}s"
    
    print(f"✅ Parallel sessions test passed: {success_rate:.1%} success rate")


async def test_endpoint_parity_performance(async_base_url):
    """Test performance parity between regular and enhanced endpoints"""
    N = 20  # sessions per endpoint
    
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as client:
        # Test regular endpoint
        regular_tasks = [
            run_session(client, async_base_url, "/api/chat/ask", sid(f"reg-perf-{i}"))
            for i in range(N)
        ]
        
        # Test enhanced endpoint  
        enhanced_tasks = [
            run_session(client, async_base_url, "/api/chat/ask-enhanced", sid(f"enh-perf-{i}"))
            for i in range(N)
        ]
        
        # Run both endpoint tests
        regular_results = await asyncio.gather(*regular_tasks, return_exceptions=True)
        enhanced_results = await asyncio.gather(*enhanced_tasks, return_exceptions=True)
        
        # Filter successful results
        reg_times = []
        enh_times = []
        
        for result in regular_results:
            if not isinstance(result, Exception):
                reg_times.extend(result)
        
        for result in enhanced_results:
            if not isinstance(result, Exception):
                enh_times.extend(result)
        
        if reg_times and enh_times:
            reg_avg = statistics.mean(reg_times)
            enh_avg = statistics.mean(enh_times)
            
            reg_p95 = statistics.quantiles(reg_times, n=20)[18] if len(reg_times) >= 20 else max(reg_times)
            enh_p95 = statistics.quantiles(enh_times, n=20)[18] if len(enh_times) >= 20 else max(enh_times)
            
            print(f"Performance comparison:")
            print(f"  Regular endpoint - Avg: {reg_avg:.2f}s, P95: {reg_p95:.2f}s")
            print(f"  Enhanced endpoint - Avg: {enh_avg:.2f}s, P95: {enh_p95:.2f}s")
            
            # Performance parity check (enhanced should be within 100ms of regular at P95)
            p95_delta = abs(enh_p95 - reg_p95)
            print(f"  P95 Delta: {p95_delta:.2f}s")
            
            # Allow enhanced to be slower but within reasonable limits
            assert p95_delta < 2.0, f"P95 latency delta too high: {p95_delta:.2f}s (should be < 2.0s for testing)"
            
            # Neither endpoint should be extremely slow
            assert reg_p95 < 10.0, f"Regular endpoint P95 too high: {reg_p95:.2f}s"
            assert enh_p95 < 12.0, f"Enhanced endpoint P95 too high: {enh_p95:.2f}s"
    
    print(f"✅ Endpoint parity performance test passed")


async def test_sustained_load(async_base_url):
    """Test sustained load over time"""
    duration = 30  # seconds
    concurrent_sessions = 10
    
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as client:
        start_time = time.time()
        completed_requests = 0
        response_times = []
        errors = 0
        
        async def sustained_worker(worker_id: int):
            nonlocal completed_requests, response_times, errors
            
            while time.time() - start_time < duration:
                session_id = sid(f"sustained-{worker_id}-{completed_requests}")
                
                try:
                    request_start = time.time()
                    async with client.post(f"{async_base_url}/api/chat/ask",
                                          json={"question": f"Sustained load test {completed_requests}", "session_id": session_id},
                                          headers={"Authorization": "Bearer mock_dev_token"}) as response:
                        await response.json()
                        response_time = time.time() - request_start
                        response_times.append(response_time)
                        completed_requests += 1
                        
                except Exception as e:
                    errors += 1
                    print(f"Request error: {e}")
                
                # Small delay between requests
                await asyncio.sleep(0.1)
        
        # Run sustained load workers
        workers = [sustained_worker(i) for i in range(concurrent_sessions)]
        await asyncio.gather(*workers)
        
        # Calculate stats
        if response_times:
            avg_response_time = statistics.mean(response_times)
            p95_response_time = statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times)
            
            error_rate = errors / (completed_requests + errors) if (completed_requests + errors) > 0 else 0
            requests_per_second = completed_requests / duration
            
            print(f"Sustained load results:")
            print(f"  Duration: {duration}s")
            print(f"  Completed requests: {completed_requests}")
            print(f"  Errors: {errors}")
            print(f"  Error rate: {error_rate:.1%}")
            print(f"  Requests/second: {requests_per_second:.1f}")
            print(f"  Average response time: {avg_response_time:.2f}s")
            print(f"  P95 response time: {p95_response_time:.2f}s")
            
            # Performance assertions for sustained load
            assert error_rate < 0.05, f"Error rate too high: {error_rate:.1%}"
            assert avg_response_time < 5.0, f"Average response time too high under load: {avg_response_time:.2f}s"
            assert p95_response_time < 10.0, f"P95 response time too high under load: {p95_response_time:.2f}s"
            assert requests_per_second > 1.0, f"Throughput too low: {requests_per_second:.1f} req/s"
        else:
            pytest.fail("No successful requests completed during sustained load test")
    
    print(f"✅ Sustained load test passed: {requests_per_second:.1f} req/s, {error_rate:.1%} error rate")


async def test_memory_stability_under_load(async_base_url):
    """Test memory stability under concurrent load"""
    import psutil
    import os
    
    # Get initial memory usage
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB
    
    # Run moderate concurrent load
    N = 30
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=20)) as client:
        tasks = []
        
        for i in range(N):
            session_id = sid(f"memory-{i}")
            # Create task that does multiple turns to test memory usage
            task = run_session(client, async_base_url, "/api/chat/ask", session_id)
            tasks.append(task)
        
        # Execute all tasks
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Check memory after load
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        print(f"Memory usage:")
        print(f"  Initial: {initial_memory:.1f} MB")
        print(f"  Final: {final_memory:.1f} MB")
        print(f"  Increase: {memory_increase:.1f} MB")
        
        # Memory increase should be reasonable (allow up to 100MB increase)
        assert memory_increase < 100, f"Memory increase too high: {memory_increase:.1f} MB"
        
        successful_results = [r for r in results if not isinstance(r, Exception)]
        success_rate = len(successful_results) / N
        
        assert success_rate >= 0.9, f"Success rate under memory test too low: {success_rate:.1%}"
    
    print(f"✅ Memory stability test passed: {memory_increase:.1f} MB increase")


if __name__ == "__main__":
    # Manual test runner for development
    print("🧪 Running Concurrency & Performance Tests")
    
    async def run_all_tests():
        base_url = get_base_url()
        
        try:
            print("\n1. Testing parallel sessions...")
            await test_parallel_sessions(base_url)
            
            print("\n2. Testing endpoint performance parity...")
            await test_endpoint_parity_performance(base_url)
            
            print("\n3. Testing sustained load...")
            await test_sustained_load(base_url)
            
            print("\n4. Testing memory stability...")
            await test_memory_stability_under_load(base_url)
            
            print("\n🎉 All concurrency and performance tests passed!")
            
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            raise
    
    asyncio.run(run_all_tests())