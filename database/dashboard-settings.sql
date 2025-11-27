-- Create dashboard settings table
create table dashboard_settings (
  id uuid default gen_random_uuid() primary key,
  cards jsonb not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable Row Level Security for dashboard settings
alter table dashboard_settings enable row level security;

-- Create policy for dashboard settings
create policy "Users can manage their own dashboard settings" on dashboard_settings
  for all using (true);

-- Enable real-time for dashboard settings
alter publication supabase_realtime add table dashboard_settings;