-- Create transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  amount decimal not null,
  description text not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  date text not null,
  time text not null,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table transactions enable row level security;

-- Create policy to allow all operations for authenticated users
create policy "Users can manage their own transactions" on transactions
  for all using (true);

-- Enable real-time subscriptions
alter publication supabase_realtime add table transactions;