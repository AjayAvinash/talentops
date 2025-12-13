# Deploy Supabase Edge Function

## Option 1: Using Supabase CLI (Recommended)

### Install Supabase CLI on Windows

**Method A: Using Scoop (Recommended for Windows)**
```bash
# Install Scoop if you don't have it
# Run in PowerShell (as Administrator):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Method B: Using npm (as local dev dependency)**
```bash
# Install as dev dependency in your project
npm install --save-dev supabase

# Then use with npx
npx supabase login
npx supabase link --project-ref zcqyifdxorlzaxkdixzx
npx supabase functions deploy embed
```

**Method C: Using Chocolatey**
```bash
choco install supabase
```

**Method D: Direct Download**
1. Go to https://github.com/supabase/cli/releases
2. Download the Windows executable
3. Add it to your PATH

### Deploy Steps (after CLI installation)

1. **Login to Supabase**:
   ```bash
   supabase login
   ```
   (or `npx supabase login` if using npm method)

2. **Link your project**:
   ```bash
   supabase link --project-ref zcqyifdxorlzaxkdixzx
   ```
   (or `npx supabase link --project-ref zcqyifdxorlzaxkdixzx`)

3. **Deploy the embed function**:
   ```bash
   supabase functions deploy embed
   ```
   (or `npx supabase functions deploy embed`)

## Option 2: Using Supabase Dashboard (EASIEST - Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com/project/zcqyifdxorlzaxkdixzx
2. Navigate to **Edge Functions** in the left sidebar
3. If the `embed` function already exists, click on it to edit. Otherwise, click **Create a new function** and name it `embed`
4. **Copy the ENTIRE contents** of `supabase/functions/embed/index.ts` into the editor
5. Click **Deploy** (or **Save** if editing)
6. Wait for deployment to complete (you'll see a success message)

**Important:** After deploying, the function should work. If you see a 500 error, check the function logs in the dashboard to see the specific error.

## Option 3: Quick Deploy with npm (Easiest - No Global Install)

Since you're already in the project directory, you can use npm to run Supabase CLI:

```bash
# Install Supabase CLI as a dev dependency
npm install --save-dev supabase

# Login
npx supabase login

# Link your project (replace with your project ref)
npx supabase link --project-ref zcqyifdxorlzaxkdixzx

# Deploy the function
npx supabase functions deploy embed
```

This avoids global installation issues!

## Verify Deployment

After deploying, test the function:

```bash
curl -X POST https://zcqyifdxorlzaxkdixzx.supabase.co/functions/v1/embed \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "test embedding"}'
```

## Note

The current implementation includes a fallback that calls Hugging Face directly from the frontend if the edge function is not available. However, for production use, the edge function is recommended as it:
- Avoids CORS issues
- Keeps API keys secure (if needed in future)
- Provides better error handling
- Reduces client-side load

