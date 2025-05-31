# Supabase Integration Guide

## 📋 Overview

This guide provides a comprehensive step-by-step process for integrating your homework management application with Supabase, including database setup, authentication, real-time features, and deployment.

## 🚀 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- Basic understanding of React and Next.js
- Git for version control

## 📝 Step 1: Supabase Project Setup

### 1.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `homework-management`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### 1.2 Get Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**
   - **Project API Key** (anon/public key)
   - **Service Role Key** (keep this secret!)

## 🔧 Step 2: Environment Configuration

### 2.1 Create Environment Variables

Create a `.env.local` file in your project root:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Custom JWT Secret (for advanced use)
SUPABASE_JWT_SECRET=your_jwt_secret_here
\`\`\`

### 2.2 Install Dependencies

\`\`\`bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
\`\`\`

## 🗄️ Step 3: Database Schema Setup

### 3.1 Run Database Schema

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the schema

### 3.2 Verify Tables Created

Check that these tables were created:
- `profiles`
- `classes`
- `students`
- `assignments`
- `assignment_students`

### 3.3 Configure Authentication

1. Go to Authentication → Settings
2. Configure Site URL: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

## 🔐 Step 4: Authentication Setup

### 4.1 Email Configuration

1. Go to Authentication → Settings → SMTP Settings
2. Enable custom SMTP (optional) or use Supabase's default
3. Customize email templates in Authentication → Templates

### 4.2 Row Level Security (RLS)

The schema automatically enables RLS. Verify policies are active:

1. Go to Authentication → Policies
2. Ensure all tables have appropriate policies
3. Test policies work correctly

## 🧪 Step 5: Testing the Integration

### 5.1 Test Database Connection

\`\`\`typescript
// Run this in your browser console after starting the app
import { testSupabaseConnection } from '@/lib/supabase/client'

testSupabaseConnection().then(result => {
  console.log('Connection test:', result)
})
\`\`\`

### 5.2 Test Authentication Flow

1. Start your development server: `npm run dev`
2. Navigate to `/auth/signup`
3. Create a test account
4. Check your email for verification
5. Try logging in at `/auth/login`

### 5.3 Test Data Operations

1. Log in to your application
2. Try creating a class
3. Add some students
4. Create assignments
5. Verify data appears in Supabase dashboard

## 🚨 Common Issues and Solutions

### Issue 1: "Invalid API Key" Error

**Symptoms**: Authentication fails with API key error

**Solutions**:
1. Verify environment variables are correct
2. Restart your development server
3. Check for typos in `.env.local`
4. Ensure you're using the anon key, not service role key for client-side

### Issue 2: RLS Policy Errors

**Symptoms**: "Row Level Security policy violation" errors

**Solutions**:
1. Check user is authenticated before data operations
2. Verify policies allow the operation
3. Test policies in SQL editor:
\`\`\`sql
-- Test as authenticated user
SELECT auth.uid(); -- Should return user ID
SELECT * FROM profiles WHERE id = auth.uid();
\`\`\`

### Issue 3: Real-time Subscriptions Not Working

**Symptoms**: Data doesn't update in real-time

**Solutions**:
1. Enable Realtime for tables in Database → Replication
2. Check subscription setup in your hooks
3. Verify network connectivity

### Issue 4: Email Verification Issues

**Symptoms**: Users don't receive verification emails

**Solutions**:
1. Check spam folder
2. Verify SMTP settings
3. Test with different email providers
4. Check Supabase logs in Dashboard → Logs

## 🔒 Security Best Practices

### 5.1 Environment Variables

- Never commit `.env.local` to version control
- Use different keys for development/production
- Rotate keys regularly

### 5.2 Row Level Security

- Always enable RLS on tables with sensitive data
- Test policies thoroughly
- Use principle of least privilege

### 5.3 API Key Management

- Use anon key for client-side operations
- Keep service role key server-side only
- Monitor API usage in dashboard

## 🚀 Deployment Configuration

### 6.1 Vercel Deployment

1. Add environment variables in Vercel dashboard
2. Update Site URL in Supabase settings
3. Add production redirect URLs

### 6.2 Custom Domain Setup

1. Configure custom domain in Vercel
2. Update Supabase Site URL
3. Update redirect URLs
4. Test authentication flow

## 📊 Performance Optimization

### 7.1 Database Optimization

\`\`\`sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_assignments_title ON assignments(title);
\`\`\`

### 7.2 Client-Side Optimization

- Use React Query for caching
- Implement pagination for large datasets
- Use Supabase's built-in filtering

### 7.3 Real-time Optimization

- Subscribe only to necessary changes
- Unsubscribe when components unmount
- Use filters to reduce payload size

## 🔍 Monitoring and Debugging

### 8.1 Supabase Dashboard

Monitor your application through:
- Database → Tables (view data)
- Authentication → Users (user management)
- Logs → All logs (error tracking)
- API → Usage (performance metrics)

### 8.2 Client-Side Debugging

\`\`\`typescript
// Enable debug mode
const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  options: {
    auth: {
      debug: process.env.NODE_ENV === 'development'
    }
  }
})
\`\`\`

## 📈 Scaling Considerations

### 9.1 Database Scaling

- Monitor connection pool usage
- Implement connection pooling for high traffic
- Consider read replicas for read-heavy workloads

### 9.2 Authentication Scaling

- Implement rate limiting
- Use session management best practices
- Monitor authentication metrics

## 🆘 Troubleshooting Checklist

When issues arise, check:

- [ ] Environment variables are set correctly
- [ ] Supabase project is active and accessible
- [ ] Database schema is properly applied
- [ ] RLS policies are configured correctly
- [ ] User is authenticated before data operations
- [ ] Network connectivity is stable
- [ ] API rate limits are not exceeded
- [ ] Browser console for client-side errors
- [ ] Supabase logs for server-side errors

## 📞 Getting Help

If you encounter issues:

1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Search GitHub issues: [github.com/supabase/supabase](https://github.com/supabase/supabase)
3. Join Supabase Discord community
4. Check this project's GitHub issues

## ✅ Success Verification

Your integration is successful when:

- [ ] Users can sign up and receive verification emails
- [ ] Users can log in and access the dashboard
- [ ] Data operations (CRUD) work correctly
- [ ] Real-time updates function properly
- [ ] RLS policies protect user data
- [ ] Application works in both development and production

## 🎉 Next Steps

After successful integration:

1. Implement additional features (file uploads, notifications)
2. Set up monitoring and analytics
3. Optimize performance based on usage patterns
4. Plan for scaling as user base grows
5. Implement backup and disaster recovery procedures

---

**Note**: This guide assumes you're using the latest versions of Next.js and Supabase. Always refer to the official documentation for the most up-to-date information.
