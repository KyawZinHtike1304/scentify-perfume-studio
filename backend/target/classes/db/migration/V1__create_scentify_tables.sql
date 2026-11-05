create table profiles (
  id uuid primary key,
  display_name varchar(255) not null default 'Studio Member',
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  order_id bigserial primary key,
  order_number varchar(100) not null unique,
  user_id uuid not null references profiles(id),
  customer_name varchar(255) not null,
  customer_email varchar(320) not null,
  customer_phone varchar(50) not null,
  shipping_address text not null,
  status varchar(30) not null default 'pending',
  payment_status varchar(30) not null default 'pending',
  payment_slip_url text,
  verified_at timestamptz,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index orders_user_id_created_at_idx on orders (user_id, created_at desc);

create table studio_chat_messages (
  id uuid primary key,
  user_id uuid not null references profiles(id),
  sender_id uuid not null references profiles(id),
  sender_role varchar(20) not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index studio_chat_messages_user_created_at_idx
  on studio_chat_messages (user_id, created_at);
