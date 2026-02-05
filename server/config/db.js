import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DB_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS || 10000),
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});

export async function ensureSchema() {
  await pool.query(`
    create extension if not exists pgcrypto;

    create table if not exists public.users (
      id uuid primary key default gen_random_uuid(),
      email text unique not null,
      password_hash text not null,
      name text,
      is_admin boolean not null default false,
      created_at timestamptz not null default now()
    );

    create table if not exists public.site_content (
      key text primary key,
      value jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    );

    insert into public.site_content (key, value)
    values (
      'services_support',
      '{
        "services": [
          {
            "id": "group_travel",
            "title": "Group Travel",
            "subtitle": "Families, friends, and small groups",
            "description": "Private itineraries across Albania, built around your pace and interests.",
            "highlights": [
              "Custom itinerary planning",
              "Trusted local partners",
              "Flexible stops & schedules"
            ]
          },
          {
            "id": "business_travel",
            "title": "Business Travel",
            "subtitle": "Reliable, punctual, and professional",
            "description": "Airport-to-meeting transfers, day planning, and support for business visitors.",
            "highlights": [
              "On-time pickups",
              "Comfortable vehicles",
              "Assistance with logistics"
            ]
          },
          {
            "id": "airport_pickup",
            "title": "Airport Pickup",
            "subtitle": "Tirana International Airport (TIA)",
            "description": "Direct pickup from Tirana Airport with clear instructions and a smooth handoff.",
            "highlights": [
              "Meet & greet",
              "Fixed pickup point",
              "Easy WhatsApp coordination"
            ]
          }
        ],
        "support": {
          "email": "support@discoveralbania.com",
          "phone": "+355",
          "whatsapp": "+355"
        },
        "safety_rules": [
          "Never share payment details or sensitive personal information over chat.",
          "Only use official contact channels shown on this page.",
          "For emergencies, contact local authorities first.",
          "Confirm pickup details (date/time/location) before the trip."
        ]
      }'::jsonb
    )
    on conflict (key) do nothing;

    create table if not exists public.destinations (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      slug text unique not null,
      region text not null,
      description text not null,
      media_urls text[] not null default '{}',
      best_time text,
      highlights text[] not null default '{}',
      activities text[] not null default '{}',
      is_featured boolean not null default false,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create index if not exists destinations_region_idx on public.destinations(region);
    create index if not exists destinations_is_featured_idx on public.destinations(is_featured);
  `);

  await pool.query(`
    create table if not exists public.packages (
      id uuid primary key default gen_random_uuid(),
      destination_id uuid not null references public.destinations(id) on delete restrict,
      name text not null,
      slug text unique not null,
      about text,
      what_youll_see text,
      itinerary text,
      whats_included text,
      whats_not_included text,
      what_to_expect text,
      meeting_and_pickup text,
      accessibility text,
      additional_information text,
      cancellation_policy text,
      help text,
      duration text,
      price text,
      currency text not null default 'EUR',
      languages text[] not null default '{}',
      group_size_max integer,
      min_age integer,
      location_name text,
      meeting_point_name text,
      meeting_point_address text,
      meeting_point_lat double precision,
      meeting_point_lng double precision,
      media_urls text[] not null default '{}',
      is_active boolean not null default false,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    do $$
    declare
      fk_name text;
      fk_del char;
    begin
      if exists (
        select 1
        from information_schema.columns
        where table_schema='public' and table_name='packages' and column_name='duration_minutes'
      ) and not exists (
        select 1
        from information_schema.columns
        where table_schema='public' and table_name='packages' and column_name='duration'
      ) then
        alter table public.packages rename column duration_minutes to duration;
        alter table public.packages alter column duration type text using duration::text;
      end if;

      if exists (
        select 1
        from information_schema.columns
        where table_schema='public' and table_name='packages' and column_name='price_cents'
      ) and not exists (
        select 1
        from information_schema.columns
        where table_schema='public' and table_name='packages' and column_name='price'
      ) then
        alter table public.packages rename column price_cents to price;
        alter table public.packages alter column price type text using price::text;
      end if;

      select c.conname, c.confdeltype
        into fk_name, fk_del
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_class rt on rt.oid = c.confrelid
      where t.relname = 'packages'
        and rt.relname = 'destinations'
        and c.contype = 'f'
      limit 1;

      if fk_name is not null and fk_del <> 'r' then
        execute 'alter table public.packages drop constraint ' || quote_ident(fk_name);
        execute 'alter table public.packages add constraint packages_destination_id_fkey foreign key (destination_id) references public.destinations(id) on delete restrict';
      end if;

      if exists (
        select 1
        from information_schema.columns
        where table_schema='public' and table_name='packages' and column_name='description'
      ) then
        update public.packages
          set about = description
        where (about is null or btrim(about) = '')
          and description is not null
          and btrim(description) <> '';

        alter table public.packages drop column if exists description;
      end if;
    end $$;

    create index if not exists packages_destination_id_idx on public.packages(destination_id);
    create index if not exists packages_is_active_idx on public.packages(is_active);
    create index if not exists packages_created_at_idx on public.packages(created_at);

    create table if not exists public.package_availability (
      id uuid primary key default gen_random_uuid(),
      package_id uuid not null references public.packages(id) on delete cascade,
      available_date date not null,
      capacity integer not null,
      remaining integer not null,
      is_open boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint package_availability_capacity_chk check (capacity >= 0),
      constraint package_availability_remaining_chk check (remaining >= 0 and remaining <= capacity),
      constraint package_availability_unique unique(package_id, available_date)
    );

    create index if not exists package_availability_package_id_idx on public.package_availability(package_id);
    create index if not exists package_availability_available_date_idx on public.package_availability(available_date);

    create table if not exists public.bookings (
      id uuid primary key default gen_random_uuid(),
      package_id uuid not null references public.packages(id) on delete restrict,
      user_id uuid references public.users(id) on delete set null,
      idempotency_key text,
      booking_date date not null,
      guest_full_name text not null,
      whatsapp_number text not null,
      adults integer not null default 1,
      children integer not null default 0,
      infants integer not null default 0,
      traveler_count integer not null,
      note text,
      status text not null default 'pending_contact',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint bookings_adults_chk check (adults >= 0),
      constraint bookings_children_chk check (children >= 0),
      constraint bookings_infants_chk check (infants >= 0),
      constraint bookings_travelers_chk check (traveler_count = (adults + children + infants) and traveler_count > 0),
      constraint bookings_status_chk check (status in ('pending_contact','confirmed','completed','cancelled'))
    );

    create index if not exists bookings_package_id_idx on public.bookings(package_id);
    create index if not exists bookings_user_id_idx on public.bookings(user_id);
    create index if not exists bookings_booking_date_idx on public.bookings(booking_date);
    create index if not exists bookings_status_idx on public.bookings(status);
    create unique index if not exists bookings_idempotency_key_uidx on public.bookings(idempotency_key) where idempotency_key is not null;

    create table if not exists public.favorites (
      user_id uuid not null references public.users(id) on delete cascade,
      package_id uuid not null references public.packages(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key(user_id, package_id)
    );

    create index if not exists favorites_package_id_idx on public.favorites(package_id);

    create table if not exists public.reviews (
      id uuid primary key default gen_random_uuid(),
      booking_id uuid not null references public.bookings(id) on delete cascade,
      user_id uuid not null references public.users(id) on delete cascade,
      package_id uuid not null references public.packages(id) on delete cascade,
      rating smallint not null,
      title text,
      body text not null,
      moderation_status text not null default 'pending',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint reviews_rating_chk check (rating >= 1 and rating <= 5),
      constraint reviews_moderation_status_chk check (moderation_status in ('pending','approved','rejected')),
      constraint reviews_booking_unique unique(booking_id)
    );

    create index if not exists reviews_package_id_idx on public.reviews(package_id);
    create index if not exists reviews_user_id_idx on public.reviews(user_id);
    create index if not exists reviews_moderation_status_idx on public.reviews(moderation_status);

    create table if not exists public.review_images (
      id uuid primary key default gen_random_uuid(),
      review_id uuid not null references public.reviews(id) on delete cascade,
      user_id uuid not null references public.users(id) on delete cascade,
      path text not null,
      created_at timestamptz not null default now()
    );

    create index if not exists review_images_review_id_idx on public.review_images(review_id);
    create index if not exists review_images_user_id_idx on public.review_images(user_id);
  `);

  if (String(process.env.ENABLE_RLS || '').toLowerCase() === 'true') {
    await pool.query(`
      create or replace function public.request_user_id() returns uuid
      language sql
      stable
      as $$
        select coalesce(
          nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
          (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid
        );
      $$;

      create or replace function public.request_is_admin() returns boolean
      language sql
      stable
      as $$
        select coalesce(
          nullif(current_setting('request.jwt.claim.is_admin', true), '')::boolean,
          (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'is_admin')::boolean,
          false
        );
      $$;

      alter table public.destinations enable row level security;
      alter table public.packages enable row level security;
      alter table public.package_availability enable row level security;
      alter table public.bookings enable row level security;
      alter table public.favorites enable row level security;
      alter table public.reviews enable row level security;
      alter table public.review_images enable row level security;
      alter table public.site_content enable row level security;

      do $$
      begin
        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='destinations' and policyname='destinations_public_read_active'
        ) then
          execute 'create policy destinations_public_read_active on public.destinations for select using (is_active = true)';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='destinations' and policyname='destinations_admin_all'
        ) then
          execute 'create policy destinations_admin_all on public.destinations for all using (public.request_is_admin()) with check (public.request_is_admin())';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='packages' and policyname='packages_public_read_active'
        ) then
          execute 'create policy packages_public_read_active on public.packages for select using (is_active = true)';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='packages' and policyname='packages_admin_all'
        ) then
          execute 'create policy packages_admin_all on public.packages for all using (public.request_is_admin()) with check (public.request_is_admin())';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='package_availability' and policyname='availability_public_read'
        ) then
          execute $$
            create policy availability_public_read
            on public.package_availability
            for select
            using (
              is_open = true
              and exists (
                select 1
                from public.packages p
                where p.id = package_availability.package_id
                  and p.is_active = true
              )
            )
          $$;
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='package_availability' and policyname='availability_admin_all'
        ) then
          execute 'create policy availability_admin_all on public.package_availability for all using (public.request_is_admin()) with check (public.request_is_admin())';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='bookings' and policyname='bookings_public_insert'
        ) then
          execute 'create policy bookings_public_insert on public.bookings for insert with check (true)';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='bookings' and policyname='bookings_user_read_own'
        ) then
          execute 'create policy bookings_user_read_own on public.bookings for select using (public.request_is_admin() or (public.request_user_id() is not null and user_id = public.request_user_id()))';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='bookings' and policyname='bookings_admin_update'
        ) then
          execute 'create policy bookings_admin_update on public.bookings for update using (public.request_is_admin()) with check (public.request_is_admin())';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='favorites' and policyname='favorites_user_all'
        ) then
          execute 'create policy favorites_user_all on public.favorites for all using (public.request_is_admin() or (public.request_user_id() is not null and user_id = public.request_user_id())) with check (public.request_is_admin() or (public.request_user_id() is not null and user_id = public.request_user_id()))';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_public_read_approved'
        ) then
          execute 'create policy reviews_public_read_approved on public.reviews for select using (moderation_status = ''approved'' or public.request_is_admin() or (public.request_user_id() is not null and user_id = public.request_user_id()))';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_user_insert_if_eligible'
        ) then
          execute $$
            create policy reviews_user_insert_if_eligible
            on public.reviews
            for insert
            with check (
              public.request_user_id() is not null
              and user_id = public.request_user_id()
              and exists (
                select 1
                from public.bookings b
                where b.id = reviews.booking_id
                  and b.user_id = public.request_user_id()
                  and b.package_id = reviews.package_id
                  and b.status = 'completed'
              )
            )
          $$;
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_admin_all'
        ) then
          execute 'create policy reviews_admin_all on public.reviews for all using (public.request_is_admin()) with check (public.request_is_admin())';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='review_images' and policyname='review_images_public_read'
        ) then
          execute $$
            create policy review_images_public_read
            on public.review_images
            for select
            using (
              public.request_is_admin()
              or (public.request_user_id() is not null and user_id = public.request_user_id())
              or exists (
                select 1
                from public.reviews r
                where r.id = review_images.review_id
                  and r.moderation_status = 'approved'
              )
            )
          $$;
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='review_images' and policyname='review_images_user_insert'
        ) then
          execute 'create policy review_images_user_insert on public.review_images for insert with check (public.request_user_id() is not null and user_id = public.request_user_id())';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='review_images' and policyname='review_images_admin_all'
        ) then
          execute 'create policy review_images_admin_all on public.review_images for all using (public.request_is_admin()) with check (public.request_is_admin())';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='site_content' and policyname='site_content_public_read'
        ) then
          execute 'create policy site_content_public_read on public.site_content for select using (true)';
        end if;

        if not exists (
          select 1 from pg_policies where schemaname='public' and tablename='site_content' and policyname='site_content_admin_all'
        ) then
          execute 'create policy site_content_admin_all on public.site_content for all using (public.request_is_admin()) with check (public.request_is_admin())';
        end if;
      end
      $$;
    `);

    if (process.env.SUPABASE_STORAGE_BUCKET) {
      const bucket = String(process.env.SUPABASE_STORAGE_BUCKET);

      await pool.query(`
        alter table storage.objects enable row level security;

        do $$
        declare
          b text := ${JSON.stringify(bucket)};
        begin
          if not exists (
            select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='albguide_public_read'
          ) then
            execute 'create policy albguide_public_read on storage.objects for select using (bucket_id = ' || quote_literal(b) || ')';
          end if;

          if not exists (
            select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='albguide_admin_write'
          ) then
            execute 'create policy albguide_admin_write on storage.objects for all using (public.request_is_admin() and bucket_id = ' || quote_literal(b) || ') with check (public.request_is_admin() and bucket_id = ' || quote_literal(b) || ')';
          end if;
        end
        $$;
      `);
    }
  }

  await pool.query(`
    alter table public.destinations
      add column if not exists media_urls text[] not null default '{}';

    alter table public.bookings
      add column if not exists idempotency_key text;

    create unique index if not exists bookings_idempotency_key_uidx on public.bookings(idempotency_key) where idempotency_key is not null;

    do $$
    begin
      if exists (
        select 1
        from information_schema.columns
        where table_schema='public'
          and table_name='destinations'
          and column_name='image_url'
      ) then
        execute '
          update public.destinations
          set media_urls = array[image_url]
          where image_url is not null
            and (media_urls is null or array_length(media_urls, 1) is null)
        ';

        execute 'alter table public.destinations drop column if exists image_url';
      end if;

      if exists (
        select 1
        from information_schema.columns
        where table_schema='public'
          and table_name='destinations'
          and column_name=('display' || '_' || 'order')
      ) then
        execute 'alter table public.destinations drop column if exists ' || quote_ident('display' || '_' || 'order');
      end if;
    end
    $$;
  `);
}
