--
-- PostgreSQL database dump
--

\restrict yXfHd3Zb69KLa4vLf108ACIkDHYCdAGnBSCWNxqJH4Htujp3wbbaw6IiHS71J7F

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cleanup_old_recent_views(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_old_recent_views() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM recent_views 
    WHERE id IN (
        SELECT id FROM recent_views 
        WHERE visitor_id = NEW.visitor_id 
        ORDER BY viewed_at DESC 
        OFFSET 50
    );
    RETURN NEW;
END;
$$;


--
-- Name: generate_booking_reference(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_booking_reference() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.booking_reference IS NULL THEN
    NEW.booking_reference := 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_farm_average_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_farm_average_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE farmer_profiles 
    SET average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM reviews 
        WHERE farm_id = NEW.farm_id
    )
    WHERE id = NEW.farm_id;
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: booking_quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_quotes (
    id integer NOT NULL,
    visitor_id integer NOT NULL,
    farmer_id integer NOT NULL,
    activity_id integer NOT NULL,
    group_size integer NOT NULL,
    preferred_date date NOT NULL,
    special_requests text,
    group_name character varying(200),
    custom_price numeric(10,2),
    custom_message text,
    valid_until timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: booking_quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_quotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_quotes_id_seq OWNED BY public.booking_quotes.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    visitor_id integer,
    farm_id integer,
    activity_id integer,
    activity_name character varying(200) NOT NULL,
    booking_date date NOT NULL,
    participants integer NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2),
    farmer_earning numeric(10,2),
    status character varying(50) DEFAULT 'pending'::character varying,
    special_requests text,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    transaction_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    start_time time without time zone,
    end_time time without time zone,
    group_name character varying(200),
    coordinator_name character varying(100),
    coordinator_email character varying(100),
    coordinator_phone character varying(20),
    discount_percentage integer DEFAULT 0,
    original_amount numeric(10,2),
    requires_quote boolean DEFAULT false,
    quote_status character varying(20) DEFAULT 'pending'::character varying,
    custom_quote_amount numeric(10,2),
    custom_quote_message text,
    quote_valid_until date,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    reschedule_request boolean DEFAULT false,
    reschedule_to_date date,
    reminder_sent boolean DEFAULT false,
    time_slot character varying(50),
    contact_phone character varying(20),
    contact_email character varying(255),
    discount_percent numeric(5,2) DEFAULT 0,
    payment_id integer,
    paid_at timestamp without time zone,
    amount_paid numeric(10,2),
    currency character varying(3) DEFAULT 'KES'::character varying,
    booking_reference character varying(50),
    google_event_id text,
    reminder_24h_sent boolean DEFAULT false,
    reminder_1h_sent boolean DEFAULT false,
    intasend_id character varying(100),
    refunded_at timestamp without time zone,
    chargeback_id character varying
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    farm_id integer,
    visitor_id integer NOT NULL,
    farmer_id integer NOT NULL,
    subject character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    product_id integer
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: escrow_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_transactions (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    intasend_txn_ref character varying(100),
    total_amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) NOT NULL,
    farmer_amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(20),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    released_at timestamp without time zone,
    refunded_at timestamp without time zone,
    chargeback_id character varying
);


--
-- Name: escrow_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.escrow_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: escrow_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.escrow_transactions_id_seq OWNED BY public.escrow_transactions.id;


--
-- Name: farm_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farm_photos (
    id integer NOT NULL,
    farmer_id integer,
    photo_url character varying(500) NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    display_order integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farm_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farm_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farm_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farm_photos_id_seq OWNED BY public.farm_photos.id;


--
-- Name: farmer_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_activities (
    id integer NOT NULL,
    farmer_id integer,
    activity_name character varying(200) NOT NULL,
    category character varying(100),
    is_custom boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    price numeric(10,2) DEFAULT 0.00,
    is_free boolean DEFAULT false,
    currency character varying(3) DEFAULT 'KES'::character varying,
    description text,
    duration_minutes integer DEFAULT 0,
    max_capacity integer DEFAULT 0
);


--
-- Name: farmer_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_activities_id_seq OWNED BY public.farmer_activities.id;


--
-- Name: farmer_animals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_animals (
    id integer NOT NULL,
    farmer_id integer,
    animal_name character varying(100) NOT NULL,
    is_custom boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farmer_animals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_animals_id_seq OWNED BY public.farmer_animals.id;


--
-- Name: farmer_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_availability (
    id integer NOT NULL,
    farmer_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    google_event_id text
);


--
-- Name: farmer_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_availability_id_seq OWNED BY public.farmer_availability.id;


--
-- Name: farmer_business_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_business_hours (
    id integer NOT NULL,
    farmer_id integer,
    day_of_week integer,
    is_open boolean DEFAULT true,
    open_time time without time zone,
    close_time time without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT farmer_business_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: farmer_business_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_business_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_business_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_business_hours_id_seq OWNED BY public.farmer_business_hours.id;


--
-- Name: farmer_crops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_crops (
    id integer NOT NULL,
    farmer_id integer,
    crop_name character varying(100) NOT NULL,
    is_custom boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farmer_crops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_crops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_crops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_crops_id_seq OWNED BY public.farmer_crops.id;


--
-- Name: farmer_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_documents (
    id integer NOT NULL,
    farmer_id integer,
    document_type character varying(50) NOT NULL,
    document_url character varying(500) NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text
);


--
-- Name: farmer_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_documents_id_seq OWNED BY public.farmer_documents.id;


--
-- Name: farmer_facilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_facilities (
    id integer NOT NULL,
    farmer_id integer,
    facility_name character varying(100) NOT NULL,
    is_custom boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farmer_facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_facilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_facilities_id_seq OWNED BY public.farmer_facilities.id;


--
-- Name: farmer_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_media (
    id integer NOT NULL,
    farmer_id integer,
    media_type character varying(20) NOT NULL,
    media_url character varying(500) NOT NULL,
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farmer_media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_media_id_seq OWNED BY public.farmer_media.id;


--
-- Name: farmer_payment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_payment_settings (
    id integer NOT NULL,
    farmer_id integer,
    bank_name character varying(100),
    account_name character varying(100),
    account_number character varying(50),
    mpesa_number character varying(20),
    payment_methods text[] DEFAULT '{cash,mpesa}'::text[],
    tax_id character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bank_code character varying(10)
);


--
-- Name: farmer_payment_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_payment_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_payment_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_payment_settings_id_seq OWNED BY public.farmer_payment_settings.id;


--
-- Name: farmer_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_photos (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    photo_data bytea NOT NULL,
    photo_type character varying(50) NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farmer_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_photos_id_seq OWNED BY public.farmer_photos.id;


--
-- Name: farmer_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_profiles (
    id integer NOT NULL,
    user_id integer,
    profile_photo_url character varying(500),
    farm_name character varying(200) NOT NULL,
    farm_location character varying(200) NOT NULL,
    farm_size character varying(50),
    year_established integer,
    farm_description text NOT NULL,
    is_verified boolean DEFAULT false,
    verification_status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    farm_type character varying(50),
    accommodation boolean DEFAULT false,
    max_guests integer,
    video_link character varying(500),
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verified_by integer,
    verification_notes text,
    verified_at timestamp without time zone,
    verification_submitted_at timestamp without time zone,
    rejection_reason text,
    rejection_notes text,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    max_guests_per_booking integer DEFAULT 50,
    daily_capacity integer DEFAULT 200,
    discount_tier1 integer DEFAULT 10,
    discount_tier2 integer DEFAULT 15,
    discount_tier3 integer DEFAULT 20,
    advance_notice_tier1 integer DEFAULT 3,
    advance_notice_tier2 integer DEFAULT 7,
    advance_notice_tier3 integer DEFAULT 14,
    require_deposit boolean DEFAULT false,
    require_waiver boolean DEFAULT false,
    require_coordinator boolean DEFAULT false,
    latitude character varying(50),
    longitude character varying(50),
    location_address text,
    city character varying(100),
    region character varying(100),
    county character varying(100),
    average_rating numeric(3,2) DEFAULT 0,
    profile_views integer DEFAULT 0,
    discount_tier1_min integer DEFAULT 11,
    discount_tier1_percent integer DEFAULT 10,
    discount_tier2_min integer DEFAULT 21,
    discount_tier2_percent integer DEFAULT 15,
    discount_tier3_min integer DEFAULT 51,
    discount_tier3_percent integer DEFAULT 20,
    advance_notice_tier1_days integer DEFAULT 3,
    advance_notice_tier2_days integer DEFAULT 7,
    advance_notice_tier3_days integer DEFAULT 14,
    require_deposit_for_large_groups boolean DEFAULT false,
    require_waiver_for_groups boolean DEFAULT false,
    require_coordinator_for_groups boolean DEFAULT false,
    notification_email_new_bookings boolean DEFAULT true,
    notification_email_new_messages boolean DEFAULT true,
    notification_email_new_reviews boolean DEFAULT true,
    notification_email_promotions boolean DEFAULT false,
    notification_sms_alerts boolean DEFAULT false,
    notification_reminder_upcoming_booking boolean DEFAULT true,
    notification_marketing_emails boolean DEFAULT false,
    google_calendar_connected boolean DEFAULT false,
    google_calendar_id text,
    google_access_token text,
    google_refresh_token text,
    google_token_expires timestamp without time zone,
    bank_account_number character varying(50),
    bank_code character varying(10),
    account_holder_name character varying(100)
);


--
-- Name: farmer_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_profiles_id_seq OWNED BY public.farmer_profiles.id;


--
-- Name: farmer_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_settings (
    id integer NOT NULL,
    farmer_id integer,
    language character varying(10) DEFAULT 'en'::character varying,
    timezone character varying(50) DEFAULT 'Africa/Nairobi'::character varying,
    notification_email_bookings boolean DEFAULT true,
    notification_email_messages boolean DEFAULT true,
    notification_email_reviews boolean DEFAULT true,
    notification_email_promotions boolean DEFAULT false,
    notification_sms boolean DEFAULT false,
    notification_booking_reminders boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farmer_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_settings_id_seq OWNED BY public.farmer_settings.id;


--
-- Name: farmer_two_factor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmer_two_factor (
    id integer NOT NULL,
    farmer_id integer,
    enabled boolean DEFAULT false,
    secret_key text,
    backup_codes text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: farmer_two_factor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmer_two_factor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmer_two_factor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmer_two_factor_id_seq OWNED BY public.farmer_two_factor.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    visitor_id integer,
    farm_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: marketplace_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_products (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    product_name character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    unit_type character varying(50) NOT NULL,
    description text,
    photos text[] DEFAULT '{}'::text[],
    location character varying(255) NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8),
    phone character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    views integer DEFAULT 0,
    share_count integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: marketplace_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.marketplace_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: marketplace_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.marketplace_products_id_seq OWNED BY public.marketplace_products.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    farmer_id integer,
    visitor_id integer,
    subject character varying(200),
    message text NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying,
    direction character varying(10) DEFAULT 'incoming'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    conversation_id integer,
    receiver_id integer,
    sender_id integer,
    is_read boolean DEFAULT false,
    product_id integer
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    user_id integer NOT NULL,
    email_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    push_notifications boolean DEFAULT true,
    booking_updates boolean DEFAULT true,
    reminders boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    data jsonb,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer,
    amount numeric(10,2) NOT NULL,
    platform_fee numeric(10,2) NOT NULL,
    farmer_earnings numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_id character varying(100),
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    currency character varying(3) DEFAULT 'KES'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    description text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: platform_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_settings_id_seq OWNED BY public.platform_settings.id;


--
-- Name: recent_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recent_views (
    id integer NOT NULL,
    visitor_id integer,
    farm_id integer,
    viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: recent_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recent_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recent_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recent_views_id_seq OWNED BY public.recent_views.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    visitor_id integer,
    farm_id integer,
    booking_id integer,
    rating integer NOT NULL,
    title character varying(200),
    comment text,
    photos text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    farm_response text,
    responded_at timestamp without time zone,
    is_edited boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    session_token character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone
);


--
-- Name: user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_sessions_id_seq OWNED BY public.user_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_verified boolean DEFAULT false,
    verified_at timestamp without time zone,
    verified_by integer,
    email_verified boolean DEFAULT false,
    email_verified_at timestamp without time zone,
    phone_verified boolean DEFAULT false,
    phone_verified_at timestamp without time zone,
    verification_code character varying(6),
    verification_code_expires timestamp without time zone,
    visitorpfp text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    two_factor_enabled boolean DEFAULT false,
    otp_code character varying(10),
    otp_expires timestamp without time zone,
    reset_token text,
    reset_token_expires timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawals (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    phone_number character varying(20),
    bank_details jsonb,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: withdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: withdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;


--
-- Name: booking_quotes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_quotes ALTER COLUMN id SET DEFAULT nextval('public.booking_quotes_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: escrow_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions ALTER COLUMN id SET DEFAULT nextval('public.escrow_transactions_id_seq'::regclass);


--
-- Name: farm_photos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farm_photos ALTER COLUMN id SET DEFAULT nextval('public.farm_photos_id_seq'::regclass);


--
-- Name: farmer_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_activities ALTER COLUMN id SET DEFAULT nextval('public.farmer_activities_id_seq'::regclass);


--
-- Name: farmer_animals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_animals ALTER COLUMN id SET DEFAULT nextval('public.farmer_animals_id_seq'::regclass);


--
-- Name: farmer_availability id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_availability ALTER COLUMN id SET DEFAULT nextval('public.farmer_availability_id_seq'::regclass);


--
-- Name: farmer_business_hours id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_business_hours ALTER COLUMN id SET DEFAULT nextval('public.farmer_business_hours_id_seq'::regclass);


--
-- Name: farmer_crops id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_crops ALTER COLUMN id SET DEFAULT nextval('public.farmer_crops_id_seq'::regclass);


--
-- Name: farmer_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_documents ALTER COLUMN id SET DEFAULT nextval('public.farmer_documents_id_seq'::regclass);


--
-- Name: farmer_facilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_facilities ALTER COLUMN id SET DEFAULT nextval('public.farmer_facilities_id_seq'::regclass);


--
-- Name: farmer_media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_media ALTER COLUMN id SET DEFAULT nextval('public.farmer_media_id_seq'::regclass);


--
-- Name: farmer_payment_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_payment_settings ALTER COLUMN id SET DEFAULT nextval('public.farmer_payment_settings_id_seq'::regclass);


--
-- Name: farmer_photos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_photos ALTER COLUMN id SET DEFAULT nextval('public.farmer_photos_id_seq'::regclass);


--
-- Name: farmer_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_profiles ALTER COLUMN id SET DEFAULT nextval('public.farmer_profiles_id_seq'::regclass);


--
-- Name: farmer_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_settings ALTER COLUMN id SET DEFAULT nextval('public.farmer_settings_id_seq'::regclass);


--
-- Name: farmer_two_factor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_two_factor ALTER COLUMN id SET DEFAULT nextval('public.farmer_two_factor_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: marketplace_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_products ALTER COLUMN id SET DEFAULT nextval('public.marketplace_products_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: platform_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings ALTER COLUMN id SET DEFAULT nextval('public.platform_settings_id_seq'::regclass);


--
-- Name: recent_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recent_views ALTER COLUMN id SET DEFAULT nextval('public.recent_views_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: user_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions ALTER COLUMN id SET DEFAULT nextval('public.user_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: withdrawals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);


--
-- Name: booking_quotes booking_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_quotes
    ADD CONSTRAINT booking_quotes_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: escrow_transactions escrow_transactions_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions
    ADD CONSTRAINT escrow_transactions_booking_id_key UNIQUE (booking_id);


--
-- Name: escrow_transactions escrow_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions
    ADD CONSTRAINT escrow_transactions_pkey PRIMARY KEY (id);


--
-- Name: farm_photos farm_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farm_photos
    ADD CONSTRAINT farm_photos_pkey PRIMARY KEY (id);


--
-- Name: farmer_activities farmer_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_activities
    ADD CONSTRAINT farmer_activities_pkey PRIMARY KEY (id);


--
-- Name: farmer_animals farmer_animals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_animals
    ADD CONSTRAINT farmer_animals_pkey PRIMARY KEY (id);


--
-- Name: farmer_availability farmer_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_availability
    ADD CONSTRAINT farmer_availability_pkey PRIMARY KEY (id);


--
-- Name: farmer_business_hours farmer_business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_business_hours
    ADD CONSTRAINT farmer_business_hours_pkey PRIMARY KEY (id);


--
-- Name: farmer_crops farmer_crops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_crops
    ADD CONSTRAINT farmer_crops_pkey PRIMARY KEY (id);


--
-- Name: farmer_documents farmer_documents_farmer_id_document_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_documents
    ADD CONSTRAINT farmer_documents_farmer_id_document_type_key UNIQUE (farmer_id, document_type);


--
-- Name: farmer_documents farmer_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_documents
    ADD CONSTRAINT farmer_documents_pkey PRIMARY KEY (id);


--
-- Name: farmer_facilities farmer_facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_facilities
    ADD CONSTRAINT farmer_facilities_pkey PRIMARY KEY (id);


--
-- Name: farmer_media farmer_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_media
    ADD CONSTRAINT farmer_media_pkey PRIMARY KEY (id);


--
-- Name: farmer_payment_settings farmer_payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_payment_settings
    ADD CONSTRAINT farmer_payment_settings_pkey PRIMARY KEY (id);


--
-- Name: farmer_photos farmer_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_photos
    ADD CONSTRAINT farmer_photos_pkey PRIMARY KEY (id);


--
-- Name: farmer_profiles farmer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_profiles
    ADD CONSTRAINT farmer_profiles_pkey PRIMARY KEY (id);


--
-- Name: farmer_settings farmer_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_settings
    ADD CONSTRAINT farmer_settings_pkey PRIMARY KEY (id);


--
-- Name: farmer_two_factor farmer_two_factor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_two_factor
    ADD CONSTRAINT farmer_two_factor_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_visitor_id_farm_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_visitor_id_farm_id_key UNIQUE (visitor_id, farm_id);


--
-- Name: marketplace_products marketplace_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_products
    ADD CONSTRAINT marketplace_products_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_key_key UNIQUE (key);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: recent_views recent_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recent_views
    ADD CONSTRAINT recent_views_pkey PRIMARY KEY (id);


--
-- Name: recent_views recent_views_visitor_id_farm_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recent_views
    ADD CONSTRAINT recent_views_visitor_id_farm_id_key UNIQUE (visitor_id, farm_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_user_id_session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_session_token_key UNIQUE (user_id, session_token);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: idx_availability_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_dates ON public.farmer_availability USING btree (start_date, end_date);


--
-- Name: idx_availability_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_availability_farmer_id ON public.farmer_availability USING btree (farmer_id);


--
-- Name: idx_bookings_booking_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_booking_date ON public.bookings USING btree (booking_date);


--
-- Name: idx_bookings_farm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_farm_id ON public.bookings USING btree (farm_id);


--
-- Name: idx_bookings_farmer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_farmer ON public.bookings USING btree (farm_id);


--
-- Name: idx_bookings_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_payment_status ON public.bookings USING btree (payment_status);


--
-- Name: idx_bookings_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_bookings_reference ON public.bookings USING btree (booking_reference);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_status_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status_date ON public.bookings USING btree (status, booking_date);


--
-- Name: idx_bookings_visitor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_visitor ON public.bookings USING btree (visitor_id);


--
-- Name: idx_bookings_visitor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_visitor_id ON public.bookings USING btree (visitor_id);


--
-- Name: idx_conversations_participants; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_participants ON public.conversations USING btree (visitor_id, farmer_id);


--
-- Name: idx_conversations_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_product_id ON public.conversations USING btree (product_id);


--
-- Name: idx_farm_photos_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farm_photos_farmer_id ON public.farm_photos USING btree (farmer_id);


--
-- Name: idx_farmer_activities_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_activities_farmer_id ON public.farmer_activities USING btree (farmer_id);


--
-- Name: idx_farmer_animals_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_animals_farmer_id ON public.farmer_animals USING btree (farmer_id);


--
-- Name: idx_farmer_crops_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_crops_farmer_id ON public.farmer_crops USING btree (farmer_id);


--
-- Name: idx_farmer_documents_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_documents_farmer_id ON public.farmer_documents USING btree (farmer_id);


--
-- Name: idx_farmer_facilities_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_facilities_farmer_id ON public.farmer_facilities USING btree (farmer_id);


--
-- Name: idx_farmer_media_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_media_farmer_id ON public.farmer_media USING btree (farmer_id);


--
-- Name: idx_farmer_profiles_coordinates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_profiles_coordinates ON public.farmer_profiles USING btree (latitude, longitude);


--
-- Name: idx_farmer_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_profiles_user_id ON public.farmer_profiles USING btree (user_id);


--
-- Name: idx_farmer_profiles_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmer_profiles_verification_status ON public.farmer_profiles USING btree (verification_status);


--
-- Name: idx_favorites_farm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_farm_id ON public.favorites USING btree (farm_id);


--
-- Name: idx_favorites_visitor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_favorites_visitor_id ON public.favorites USING btree (visitor_id);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: idx_messages_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_farmer_id ON public.messages USING btree (farmer_id);


--
-- Name: idx_messages_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_product_id ON public.messages USING btree (product_id);


--
-- Name: idx_messages_receiver_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_receiver_read ON public.messages USING btree (receiver_id, is_read);


--
-- Name: idx_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_status ON public.messages USING btree (status);


--
-- Name: idx_messages_visitor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_visitor_id ON public.messages USING btree (visitor_id);


--
-- Name: idx_notification_prefs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_prefs_user ON public.notification_preferences USING btree (user_id);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_payments_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_transaction_id ON public.payments USING btree (transaction_id);


--
-- Name: idx_quotes_farmer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_farmer ON public.booking_quotes USING btree (farmer_id);


--
-- Name: idx_quotes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_status ON public.booking_quotes USING btree (status);


--
-- Name: idx_recent_views_farm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recent_views_farm_id ON public.recent_views USING btree (farm_id);


--
-- Name: idx_recent_views_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recent_views_viewed_at ON public.recent_views USING btree (viewed_at);


--
-- Name: idx_recent_views_visitor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_recent_views_visitor_id ON public.recent_views USING btree (visitor_id);


--
-- Name: idx_reviews_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_booking_id ON public.reviews USING btree (booking_id);


--
-- Name: idx_reviews_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_created_at ON public.reviews USING btree (created_at);


--
-- Name: idx_reviews_farm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_farm_id ON public.reviews USING btree (farm_id);


--
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);


--
-- Name: idx_reviews_visitor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_visitor_id ON public.reviews USING btree (visitor_id);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: recent_views limit_recent_views; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER limit_recent_views AFTER INSERT ON public.recent_views FOR EACH ROW EXECUTE FUNCTION public.cleanup_old_recent_views();


--
-- Name: bookings set_booking_reference; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_booking_reference BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.generate_booking_reference();


--
-- Name: reviews update_farm_rating_on_review; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_farm_rating_on_review AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_farm_average_rating();


--
-- Name: farmer_availability update_farmer_availability_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_farmer_availability_updated_at BEFORE UPDATE ON public.farmer_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: booking_quotes booking_quotes_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_quotes
    ADD CONSTRAINT booking_quotes_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.farmer_activities(id);


--
-- Name: booking_quotes booking_quotes_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_quotes
    ADD CONSTRAINT booking_quotes_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: booking_quotes booking_quotes_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_quotes
    ADD CONSTRAINT booking_quotes_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.farmer_activities(id);


--
-- Name: bookings bookings_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: bookings bookings_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.marketplace_products(id);


--
-- Name: conversations conversations_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: escrow_transactions escrow_transactions_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_transactions
    ADD CONSTRAINT escrow_transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: farm_photos farm_photos_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farm_photos
    ADD CONSTRAINT farm_photos_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_activities farmer_activities_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_activities
    ADD CONSTRAINT farmer_activities_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_animals farmer_animals_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_animals
    ADD CONSTRAINT farmer_animals_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_availability farmer_availability_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_availability
    ADD CONSTRAINT farmer_availability_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_business_hours farmer_business_hours_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_business_hours
    ADD CONSTRAINT farmer_business_hours_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_crops farmer_crops_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_crops
    ADD CONSTRAINT farmer_crops_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_documents farmer_documents_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_documents
    ADD CONSTRAINT farmer_documents_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_facilities farmer_facilities_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_facilities
    ADD CONSTRAINT farmer_facilities_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_media farmer_media_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_media
    ADD CONSTRAINT farmer_media_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_payment_settings farmer_payment_settings_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_payment_settings
    ADD CONSTRAINT farmer_payment_settings_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_photos farmer_photos_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_photos
    ADD CONSTRAINT farmer_photos_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_profiles farmer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_profiles
    ADD CONSTRAINT farmer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: farmer_profiles farmer_profiles_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_profiles
    ADD CONSTRAINT farmer_profiles_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: farmer_settings farmer_settings_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_settings
    ADD CONSTRAINT farmer_settings_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: farmer_two_factor farmer_two_factor_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmer_two_factor
    ADD CONSTRAINT farmer_two_factor_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: marketplace_products marketplace_products_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_products
    ADD CONSTRAINT marketplace_products_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: messages messages_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.marketplace_products(id);


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: recent_views recent_views_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recent_views
    ADD CONSTRAINT recent_views_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: recent_views recent_views_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recent_views
    ADD CONSTRAINT recent_views_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_farm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farmer_profiles(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_visitor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_visitor_id_fkey FOREIGN KEY (visitor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict yXfHd3Zb69KLa4vLf108ACIkDHYCdAGnBSCWNxqJH4Htujp3wbbaw6IiHS71J7F

