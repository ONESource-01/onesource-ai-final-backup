"""
Weekly Business Intelligence Reporting Service
Automated reports for ONESource-ai platform insights
"""

import os
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dataclasses import dataclass
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from firebase_service import FirebaseService
from motor.motor_asyncio import AsyncIOMotorClient
import json


@dataclass
class WeeklyReportData:
    """Structure for weekly report data"""
    period_start: datetime
    period_end: datetime
    new_subscribers: List[Dict[str, Any]]
    subscription_payments: Dict[str, Any]
    usage_statistics: Dict[str, Any]
    knowledge_bank_updates: Dict[str, Any]
    top_questions: List[Dict[str, str]]
    user_feedback: List[Dict[str, Any]]


class WeeklyReportingService:
    """Service for generating and emailing weekly business intelligence reports"""
    
    def __init__(self):
        self.firebase_service = FirebaseService()
        self.mongo_client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
        self.db = self.mongo_client.onesource_ai
        
        # Initialize SendGrid only if API key is available and valid
        sendgrid_key = os.environ.get('SENDGRID_API_KEY')
        # Check if API key is valid (not placeholder or empty)
        valid_api_key = sendgrid_key and sendgrid_key not in ['your-sendgrid-api-key', 'placeholder', 'test-key']
        self.sendgrid = SendGridAPIClient(sendgrid_key) if valid_api_key else None
        self.sendgrid_configured = bool(valid_api_key)
        
        self.admin_email = os.environ.get('ADMIN_EMAIL', 'admin@onesource-ai.com')
        self.platform_url = os.environ.get('PLATFORM_URL', 'https://onesource-ai.com')
    
    async def collect_weekly_data(self, start_date: datetime, end_date: datetime) -> WeeklyReportData:
        """Collect all data needed for the weekly report"""
        
        # New subscribers from Firebase
        new_subscribers = await self._get_new_subscribers(start_date, end_date)
        
        # Subscription payments from database
        subscription_payments = await self._get_subscription_payments(start_date, end_date)
        
        # Usage statistics
        usage_statistics = await self._get_usage_statistics(start_date, end_date)
        
        # Knowledge bank updates
        knowledge_bank_updates = await self._get_knowledge_bank_updates(start_date, end_date)
        
        # Top questions asked
        top_questions = await self._get_top_questions(start_date, end_date)
        
        # User feedback
        user_feedback = await self._get_user_feedback(start_date, end_date)
        
        return WeeklyReportData(
            period_start=start_date,
            period_end=end_date,
            new_subscribers=new_subscribers,
            subscription_payments=subscription_payments,
            usage_statistics=usage_statistics,
            knowledge_bank_updates=knowledge_bank_updates,
            top_questions=top_questions,
            user_feedback=user_feedback
        )
    
    async def _get_new_subscribers(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get new subscribers from Firebase during the period"""
        try:
            # Query user profiles created in the date range
            cursor = self.db.user_profiles.find({
                "created_at": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            })
            
            new_users = await cursor.to_list(length=None)
            
            subscribers = []
            for user in new_users:
                subscriber_data = {
                    "user_id": user.get("user_id"),
                    "email": user.get("email", "Unknown"),
                    "name": user.get("name", "Not provided"),
                    "profession": user.get("profession", "Not specified"),
                    "sector": user.get("sector", "Not specified"),
                    "signup_date": user.get("created_at").isoformat() if user.get("created_at") else "Unknown",
                    "subscription_tier": user.get("subscription_tier", "Starter"),
                    "profile_link": f"{self.platform_url}/admin/users/{user.get('user_id', '')}"
                }
                subscribers.append(subscriber_data)
            
            return subscribers
            
        except Exception as e:
            print(f"Error getting new subscribers: {e}")
            return []
    
    async def _get_subscription_payments(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get subscription payment data for the period"""
        try:
            # Query payment sessions in the date range
            payment_cursor = self.db.payment_sessions.find({
                "created_at": {
                    "$gte": start_date,
                    "$lte": end_date
                },
                "payment_status": "completed"
            })
            
            payments = await payment_cursor.to_list(length=None)
            
            # Analyze payments by tier
            tier_revenue = {"pro": 0, "consultant": 0, "day_pass": 0}
            tier_counts = {"pro": 0, "consultant": 0, "day_pass": 0}
            total_revenue = 0
            
            payment_details = []
            
            for payment in payments:
                tier = payment.get("package_id", "unknown")
                amount = payment.get("amount", 0)
                
                if tier in tier_revenue:
                    tier_revenue[tier] += amount
                    tier_counts[tier] += 1
                
                total_revenue += amount
                
                payment_details.append({
                    "date": payment.get("created_at").strftime("%Y-%m-%d %H:%M") if payment.get("created_at") else "Unknown",
                    "user_email": payment.get("user_email", "Unknown"),
                    "package": tier.replace("_", " ").title(),
                    "amount": f"${amount:.2f}",
                    "session_id": payment.get("session_id", ""),
                    "payment_link": f"{self.platform_url}/admin/payments/{payment.get('session_id', '')}"
                })
            
            return {
                "total_revenue": total_revenue,
                "tier_revenue": tier_revenue,
                "tier_counts": tier_counts,
                "payment_details": payment_details,
                "total_transactions": len(payments)
            }
            
        except Exception as e:
            print(f"Error getting subscription payments: {e}")
            return {"total_revenue": 0, "tier_revenue": {}, "tier_counts": {}, "payment_details": [], "total_transactions": 0}
    
    async def _get_usage_statistics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get platform usage statistics"""
        try:
            # Chat sessions
            chat_cursor = self.db.chat_sessions.find({
                "created_at": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            })
            
            chat_sessions = await chat_cursor.to_list(length=None)
            
            # Knowledge vault searches
            search_cursor = self.db.knowledge_searches.find({
                "timestamp": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }) if await self.db.knowledge_searches.count_documents({}) > 0 else []
            
            searches = await search_cursor.to_list(length=None) if search_cursor else []
            
            # Active users (users who asked questions)
            active_users = set()
            total_questions = 0
            enhanced_questions = 0
            
            for session in chat_sessions:
                if session.get("user_id"):
                    active_users.add(session["user_id"])
                
                messages_count = session.get("message_count", 0)
                total_questions += messages_count
                
                if session.get("enhanced_mode", False):
                    enhanced_questions += messages_count
            
            return {
                "total_chat_sessions": len(chat_sessions),
                "total_questions_asked": total_questions,
                "enhanced_questions": enhanced_questions,
                "knowledge_searches": len(searches),
                "active_users": len(active_users),
                "avg_questions_per_session": round(total_questions / len(chat_sessions), 2) if chat_sessions else 0,
                "usage_dashboard_link": f"{self.platform_url}/admin/usage-analytics"
            }
            
        except Exception as e:
            print(f"Error getting usage statistics: {e}")
            return {"total_chat_sessions": 0, "total_questions_asked": 0, "enhanced_questions": 0, "knowledge_searches": 0, "active_users": 0}
    
    async def _get_knowledge_bank_updates(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get knowledge bank content updates"""
        try:
            # New documents uploaded
            doc_cursor = self.db.knowledge_documents.find({
                "uploaded_at": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            })
            
            new_documents = await doc_cursor.to_list(length=None)
            
            # New mentor notes
            notes_cursor = self.db.mentor_notes.find({
                "created_at": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            })
            
            new_notes = await notes_cursor.to_list(length=None)
            
            # Categorize documents
            document_types = {}
            supplier_content = 0
            
            for doc in new_documents:
                doc_type = doc.get("file_type", "unknown")
                document_types[doc_type] = document_types.get(doc_type, 0) + 1
                
                if doc.get("is_supplier_content", False):
                    supplier_content += 1
            
            # Document details for review
            document_details = []
            for doc in new_documents[:10]:  # Show first 10
                document_details.append({
                    "filename": doc.get("filename", "Unknown"),
                    "uploaded_by": doc.get("uploaded_by_email", "Unknown"),
                    "upload_date": doc.get("uploaded_at").strftime("%Y-%m-%d %H:%M") if doc.get("uploaded_at") else "Unknown",
                    "file_size": f"{doc.get('file_size', 0) / 1024:.1f} KB" if doc.get('file_size') else "Unknown",
                    "is_supplier": "Yes" if doc.get("is_supplier_content") else "No",
                    "document_link": f"{self.platform_url}/admin/documents/{doc.get('document_id', '')}"
                })
            
            # Note details
            note_details = []
            for note in new_notes[:10]:  # Show first 10
                note_details.append({
                    "title": note.get("title", "Untitled"),
                    "created_by": note.get("created_by_email", "Unknown"),
                    "creation_date": note.get("created_at").strftime("%Y-%m-%d %H:%M") if note.get("created_at") else "Unknown",
                    "category": note.get("category", "General"),
                    "note_link": f"{self.platform_url}/admin/notes/{note.get('note_id', '')}"
                })
            
            return {
                "new_documents_count": len(new_documents),
                "new_mentor_notes_count": len(new_notes),
                "document_types": document_types,
                "supplier_content_count": supplier_content,
                "document_details": document_details,
                "note_details": note_details,
                "knowledge_vault_link": f"{self.platform_url}/admin/knowledge-vault"
            }
            
        except Exception as e:
            print(f"Error getting knowledge bank updates: {e}")
            return {"new_documents_count": 0, "new_mentor_notes_count": 0, "document_types": {}, "supplier_content_count": 0}
    
    async def _get_top_questions(self, start_date: datetime, end_date: datetime) -> List[Dict[str, str]]:
        """Get most frequently asked questions"""
        try:
            # This would require aggregating similar questions
            # For now, return recent unique questions
            cursor = self.db.chat_sessions.find(
                {
                    "created_at": {
                        "$gte": start_date,
                        "$lte": end_date
                    },
                    "first_question": {"$exists": True}
                },
                {"first_question": 1, "user_id": 1, "created_at": 1}
            ).limit(20)
            
            questions = await cursor.to_list(length=20)
            
            top_questions = []
            for q in questions:
                question_text = q.get("first_question", "")[:100] + "..." if len(q.get("first_question", "")) > 100 else q.get("first_question", "")
                top_questions.append({
                    "question": question_text,
                    "date": q.get("created_at").strftime("%Y-%m-%d") if q.get("created_at") else "Unknown",
                    "user_id": q.get("user_id", "Anonymous")
                })
            
            return top_questions
            
        except Exception as e:
            print(f"Error getting top questions: {e}")
            return []
    
    async def _get_user_feedback(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get user feedback from the period"""
        try:
            cursor = self.db.chat_feedback.find({
                "timestamp": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }).sort("timestamp", -1).limit(20)
            
            feedback_list = await cursor.to_list(length=20)
            
            feedback_summary = []
            positive_count = 0
            negative_count = 0
            
            for feedback in feedback_list:
                feedback_type = feedback.get("feedback_type", "neutral")
                if feedback_type == "positive":
                    positive_count += 1
                elif feedback_type == "negative":
                    negative_count += 1
                
                feedback_summary.append({
                    "type": feedback_type.title(),
                    "comment": feedback.get("comment", "No comment")[:150] + "..." if len(feedback.get("comment", "")) > 150 else feedback.get("comment", "No comment"),
                    "date": feedback.get("timestamp").strftime("%Y-%m-%d %H:%M") if feedback.get("timestamp") else "Unknown",
                    "user_email": feedback.get("user_email", "Anonymous"),
                    "feedback_link": f"{self.platform_url}/admin/feedback/{feedback.get('feedback_id', '')}"
                })
            
            return {
                "feedback_items": feedback_summary,
                "positive_count": positive_count,
                "negative_count": negative_count,
                "total_feedback": len(feedback_list)
            }
            
        except Exception as e:
            print(f"Error getting user feedback: {e}")
            return {"feedback_items": [], "positive_count": 0, "negative_count": 0, "total_feedback": 0}
    
    def _generate_html_report(self, data: WeeklyReportData) -> str:
        """Generate HTML email report"""
        
        period_str = f"{data.period_start.strftime('%B %d, %Y')} - {data.period_end.strftime('%B %d, %Y')}"
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M')
        
        # Build dynamic sections with proper escaping
        subscriber_growth_msg = "🎉 Great week for growth!" if len(data.new_subscribers) > 5 else "Steady growth continuing." if len(data.new_subscribers) > 0 else "Focus needed on user acquisition."
        
        # Generate subscriber table rows
        subscriber_rows = ""
        if data.new_subscribers:
            subscriber_rows = "<table class='table'><tr><th>Email</th><th>Name</th><th>Profession</th><th>Signup Date</th><th>Tier</th><th>Profile</th></tr>"
            for sub in data.new_subscribers[:10]:
                subscriber_rows += f"<tr><td>{sub['email']}</td><td>{sub['name']}</td><td>{sub['profession']}</td><td>{sub['signup_date'][:10]}</td><td>{sub['subscription_tier']}</td><td><a href='{sub['profile_link']}' class='link'>View</a></td></tr>"
            subscriber_rows += "</table>"
        else:
            subscriber_rows = "<p>No new subscribers this week.</p>"
        
        # Generate payment table rows
        payment_rows = ""
        if data.subscription_payments.get('payment_details'):
            payment_rows = f"<h3>Recent Payments ({data.subscription_payments.get('total_transactions', 0)} transactions)</h3>"
            payment_rows += "<table class='table'><tr><th>Date</th><th>User</th><th>Package</th><th>Amount</th><th>Details</th></tr>"
            for payment in data.subscription_payments.get('payment_details', [])[:10]:
                payment_rows += f"<tr><td>{payment['date']}</td><td>{payment['user_email']}</td><td>{payment['package']}</td><td>{payment['amount']}</td><td><a href='{payment['payment_link']}' class='link'>View</a></td></tr>"
            payment_rows += "</table>"
        else:
            payment_rows = "<p>No payments processed this week.</p>"
        
        # Generate document table rows  
        document_rows = ""
        if data.knowledge_bank_updates.get('document_details'):
            document_rows = f"<h3>Recent Document Uploads ({data.knowledge_bank_updates.get('new_documents_count', 0)} total)</h3>"
            document_rows += "<table class='table'><tr><th>Filename</th><th>Uploaded By</th><th>Date</th><th>Size</th><th>Supplier</th><th>View</th></tr>"
            for doc in data.knowledge_bank_updates.get('document_details', []):
                filename_display = doc['filename'][:40] + "..." if len(doc['filename']) > 40 else doc['filename']
                document_rows += f"<tr><td>{filename_display}</td><td>{doc['uploaded_by']}</td><td>{doc['upload_date'][:10]}</td><td>{doc['file_size']}</td><td>{doc['is_supplier']}</td><td><a href='{doc['document_link']}' class='link'>View</a></td></tr>"
            document_rows += "</table>"
        else:
            document_rows = "<p>No new documents uploaded this week.</p>"
        
        # Generate note table rows
        note_rows = ""
        if data.knowledge_bank_updates.get('note_details'):
            note_rows = f"<h3>Recent Mentor Notes ({data.knowledge_bank_updates.get('new_mentor_notes_count', 0)} total)</h3>"
            note_rows += "<table class='table'><tr><th>Title</th><th>Created By</th><th>Date</th><th>Category</th><th>View</th></tr>"
            for note in data.knowledge_bank_updates.get('note_details', []):
                title_display = note['title'][:50] + "..." if len(note['title']) > 50 else note['title']
                note_rows += f"<tr><td>{title_display}</td><td>{note['created_by']}</td><td>{note['creation_date'][:10]}</td><td>{note['category']}</td><td><a href='{note['note_link']}' class='link'>View</a></td></tr>"
            note_rows += "</table>"
        else:
            note_rows = "<p>No new mentor notes created this week.</p>"
        
        # Generate questions list
        questions_list = ""
        if data.top_questions:
            questions_list = "<ul>"
            for q in data.top_questions[:10]:
                questions_list += f"<li><strong>Q:</strong> {q['question']} <em>({q['date']})</em></li>"
            questions_list += "</ul>"
        else:
            questions_list = "<p>No questions captured this period.</p>"
        
        # Generate feedback items
        feedback_items = ""
        if data.user_feedback.get('feedback_items'):
            feedback_items = "<h3>Recent Feedback Items</h3>"
            for item in data.user_feedback.get('feedback_items', [])[:8]:
                border_color = '#16a34a' if item['type'] == 'Positive' else '#dc2626'
                class_name = 'positive' if item['type'] == 'Positive' else 'negative'
                feedback_items += f"<div style='margin: 15px 0; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid {border_color};'><strong class='{class_name}'>{item['type']}</strong> from {item['user_email']} on {item['date']}<br><em>\"{item['comment']}\"</em><br><a href='{item['feedback_link']}' class='link'>View Details</a></div>"
        else:
            feedback_items = "<p>No feedback received this week.</p>"
        
        # Generate action items based on data
        action_items = []
        if len(data.new_subscribers) > 5:
            action_items.append("<li>🚀 <strong>Growth Momentum:</strong> Leverage the strong subscriber growth with targeted marketing campaigns.</li>")
        else:
            action_items.append("<li>📈 <strong>Growth Focus:</strong> Consider user acquisition strategies to increase new subscriber rate.</li>")
        
        if data.subscription_payments.get('total_revenue', 0) > 100:
            action_items.append("<li>💰 <strong>Revenue Optimization:</strong> Strong payment conversion - consider promoting Pro-Plus features.</li>")
        else:
            action_items.append("<li>💡 <strong>Conversion Focus:</strong> Analyze user journey to improve free-to-paid conversion.</li>")
        
        if data.knowledge_bank_updates.get('new_documents_count', 0) > 10:
            action_items.append("<li>📚 <strong>Content Expansion:</strong> High knowledge bank activity - encourage more expert contributions.</li>")
        else:
            action_items.append("<li>📖 <strong>Content Strategy:</strong> Develop initiatives to increase knowledge base contributions.</li>")
        
        if data.user_feedback.get('positive_count', 0) > data.user_feedback.get('negative_count', 0) * 2:
            action_items.append("<li>😊 <strong>User Satisfaction:</strong> Excellent feedback ratio - maintain quality standards.</li>")
        else:
            action_items.append("<li>🔧 <strong>Quality Improvement:</strong> Address user feedback to enhance platform experience.</li>")
        
        action_items.append("<li>🔍 <strong>Analytics Review:</strong> Deep-dive into usage patterns to identify optimization opportunities.</li>")
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; }}
                .header {{ background: linear-gradient(135deg, #0f2f57 0%, #4b6b8b 100%); color: white; padding: 30px; text-align: center; }}
                .section {{ margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #0f2f57; }}
                .metric {{ display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: white; border-radius: 8px; text-align: center; min-width: 120px; }}
                .metric-value {{ font-size: 24px; font-weight: bold; color: #0f2f57; }}
                .metric-label {{ color: #4b6b8b; font-size: 12px; }}
                .table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
                .table th, .table td {{ padding: 12px; text-align: left; border-bottom: 1px solid #c9d6e4; }}
                .table th {{ background-color: #0f2f57; color: white; }}
                .link {{ color: #0f2f57; text-decoration: none; }}
                .link:hover {{ text-decoration: underline; }}
                .positive {{ color: #16a34a; }}
                .negative {{ color: #dc2626; }}
                .footer {{ text-align: center; margin-top: 40px; padding: 20px; color: #95a6b7; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 ONESource-ai Weekly Business Report</h1>
                <h2>{period_str}</h2>
                <p>Your comprehensive platform intelligence update</p>
            </div>

            <!-- Executive Summary -->
            <div class="section">
                <h2>📈 Executive Summary</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">{len(data.new_subscribers)}</div>
                        <div class="metric-label">New Subscribers</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${data.subscription_payments.get('total_revenue', 0):.2f}</div>
                        <div class="metric-label">Revenue Generated</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.usage_statistics.get('total_questions_asked', 0)}</div>
                        <div class="metric-label">Questions Asked</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.knowledge_bank_updates.get('new_documents_count', 0)}</div>
                        <div class="metric-label">Documents Added</div>
                    </div>
                </div>
                <p><a href="{self.platform_url}/admin" class="link">👉 View Full Admin Dashboard</a></p>
            </div>

            <!-- New Subscribers -->
            <div class="section">
                <h2>👥 New Subscribers ({len(data.new_subscribers)} this week)</h2>
                <p>{subscriber_growth_msg}</p>
                
                {subscriber_rows}
                
                {"<p><em>Showing first 10 of " + str(len(data.new_subscribers)) + " new subscribers.</em></p>" if len(data.new_subscribers) > 10 else ""}
            </div>

            <!-- Revenue & Subscriptions -->
            <div class="section">
                <h2>💰 Revenue & Subscriptions</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">{data.subscription_payments.get('tier_counts', {}).get('pro', 0)}</div>
                        <div class="metric-label">Pro Subscriptions</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.subscription_payments.get('tier_counts', {}).get('consultant', 0)}</div>
                        <div class="metric-label">Pro-Plus Subscriptions</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.subscription_payments.get('tier_counts', {}).get('day_pass', 0)}</div>
                        <div class="metric-label">Day Passes</div>
                    </div>
                </div>
                
                {payment_rows}
                
                <p><a href="{self.platform_url}/admin/revenue" class="link">👉 View Detailed Revenue Analytics</a></p>
            </div>

            <!-- Usage Statistics -->
            <div class="section">
                <h2>📊 Platform Usage</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">{data.usage_statistics.get('active_users', 0)}</div>
                        <div class="metric-label">Active Users</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.usage_statistics.get('total_chat_sessions', 0)}</div>
                        <div class="metric-label">Chat Sessions</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.usage_statistics.get('enhanced_questions', 0)}</div>
                        <div class="metric-label">Knowledge Enhanced</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.usage_statistics.get('avg_questions_per_session', 0)}</div>
                        <div class="metric-label">Avg Q's per Session</div>
                    </div>
                </div>
                <p><a href="{data.usage_statistics.get('usage_dashboard_link', self.platform_url + '/admin')}" class="link">👉 View Usage Dashboard</a></p>
            </div>

            <!-- Knowledge Bank Updates -->
            <div class="section">
                <h2>📚 Knowledge Bank Updates</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">{data.knowledge_bank_updates.get('new_documents_count', 0)}</div>
                        <div class="metric-label">New Documents</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.knowledge_bank_updates.get('new_mentor_notes_count', 0)}</div>
                        <div class="metric-label">New Mentor Notes</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.knowledge_bank_updates.get('supplier_content_count', 0)}</div>
                        <div class="metric-label">Supplier Content</div>
                    </div>
                </div>

                {document_rows}

                {note_rows}
                
                <p><a href="{data.knowledge_bank_updates.get('knowledge_vault_link', self.platform_url + '/admin')}" class="link">👉 Manage Knowledge Vault</a></p>
            </div>

            <!-- Top Questions -->
            <div class="section">
                <h2>❓ Popular Questions This Week</h2>
                {questions_list}
                <p><em>Understanding user questions helps improve AI responses and identify content gaps.</em></p>
            </div>

            <!-- User Feedback -->
            <div class="section">
                <h2>💬 User Feedback</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value positive">{data.user_feedback.get('positive_count', 0)}</div>
                        <div class="metric-label">Positive Feedback</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value negative">{data.user_feedback.get('negative_count', 0)}</div>
                        <div class="metric-label">Negative Feedback</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{data.user_feedback.get('total_feedback', 0)}</div>
                        <div class="metric-label">Total Feedback</div>
                    </div>
                </div>

                {feedback_items}
                
                <p><a href="{self.platform_url}/admin/feedback" class="link">👉 View All Feedback</a></p>
            </div>

            <!-- Action Items -->
            <div class="section">
                <h2>🎯 Recommended Actions</h2>
                <ul>
                    {"".join(action_items)}
                </ul>
            </div>

            <!-- Quick Links -->
            <div class="section">
                <h2>🔗 Quick Access Links</h2>
                <p>
                    <a href="{self.platform_url}/admin" class="link">🏠 Admin Dashboard</a> | 
                    <a href="{self.platform_url}/admin/users" class="link">👥 User Management</a> | 
                    <a href="{self.platform_url}/admin/revenue" class="link">💰 Revenue Analytics</a> | 
                    <a href="{self.platform_url}/admin/knowledge-vault" class="link">📚 Knowledge Vault</a> | 
                    <a href="{self.platform_url}/admin/feedback" class="link">💬 Feedback Center</a> | 
                    <a href="{self.platform_url}/admin/settings" class="link">⚙️ Platform Settings</a>
                </p>
            </div>

            <div class="footer">
                <p>📧 This automated report is generated every Monday at 9:00 AM AEDT</p>
                <p>ONESource-ai Business Intelligence • Generated on {current_time} AEDT</p>
                <p>Questions about this report? Reply to this email or contact support.</p>
            </div>
        </body>
        </html>
        """
        
        return html_content
    
    async def send_weekly_report(self, admin_email: str = None):
        """Generate and send the weekly report"""
        try:
            # Check if SendGrid is configured
            if not self.sendgrid_configured:
                print("⚠️ SendGrid API key not configured. Report generated but email not sent.")
                print("To enable email reports, add SENDGRID_API_KEY to your environment variables.")
                
                # Still generate the report for debugging/logging purposes
                end_date = datetime.now()
                start_date = end_date - timedelta(days=7)
                report_data = await self.collect_weekly_data(start_date, end_date)
                html_content = self._generate_html_report(report_data)
                
                # Log report summary
                print(f"📊 Weekly Report Summary ({start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}):")
                print(f"  • New Subscribers: {len(report_data.new_subscribers)}")
                print(f"  • Revenue: ${report_data.subscription_payments.get('total_revenue', 0):.2f}")
                print(f"  • Questions Asked: {report_data.usage_statistics.get('total_questions_asked', 0)}")
                print(f"  • Documents Added: {report_data.knowledge_bank_updates.get('new_documents_count', 0)}")
                
                return {"success": False, "message": "SendGrid API key not configured", "data_collected": True}
            
            # Calculate date range (previous 7 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
            
            # Collect data
            print(f"Collecting weekly report data for {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
            report_data = await self.collect_weekly_data(start_date, end_date)
            
            # Generate email content
            html_content = self._generate_html_report(report_data)
            
            # Prepare email
            subject = f"📊 ONESource-ai Weekly Report - {start_date.strftime('%b %d')} to {end_date.strftime('%b %d, %Y')}"
            recipient_email = admin_email or self.admin_email
            
            message = Mail(
                from_email=os.environ.get('SENDER_EMAIL', 'reports@onesource-ai.com'),
                to_emails=recipient_email,
                subject=subject,
                html_content=html_content
            )
            
            # Send email
            response = self.sendgrid.send(message)
            
            if response.status_code == 202:
                print(f"✅ Weekly report sent successfully to {recipient_email}")
                return {"success": True, "message": f"Report sent to {recipient_email}"}
            else:
                print(f"❌ Failed to send weekly report. Status code: {response.status_code}")
                return {"success": False, "message": f"Email sending failed with status {response.status_code}"}
                
        except Exception as e:
            print(f"❌ Error sending weekly report: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}
    
    async def close_connections(self):
        """Close database connections"""
        if self.mongo_client:
            self.mongo_client.close()


# Scheduled task runner
async def run_weekly_report():
    """Run the weekly report - called by scheduler"""
    reporting_service = WeeklyReportingService()
    try:
        success = await reporting_service.send_weekly_report()
        return success
    finally:
        await reporting_service.close_connections()


# Manual testing function
async def test_weekly_report(admin_email: str):
    """Test the weekly report manually"""
    reporting_service = WeeklyReportingService()
    try:
        result = await reporting_service.send_weekly_report(admin_email)
        
        # Handle both old boolean return and new dict return
        if isinstance(result, dict):
            success = result["success"]
            print(f"Test report result: {'✅ Success' if success else '⚠️ No Email Sent'}")
            print(f"Message: {result['message']}")
        else:
            success = result
            print(f"Test report sent: {'✅ Success' if success else '❌ Failed'}")
        
        return result
    finally:
        await reporting_service.close_connections()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        test_email = sys.argv[1]
        asyncio.run(test_weekly_report(test_email))
    else:
        asyncio.run(run_weekly_report())