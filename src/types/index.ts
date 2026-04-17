export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: "user" | "superadmin";
  status: "active" | "blocked" | "suspended";
  timezone: string;
  locale: "en" | "ar";
  appearance: "light" | "dark" | "system";
  api_key: string;
  totp_enabled: boolean;
  onboarding: {
    domain_added: boolean;
    script_installed: boolean;
    first_event_received: boolean;
    funnel_created: boolean;
  };
  created_at: string;
}

export interface Domain {
  id: number;
  user_id: number;
  domain: string;
  script_token: string;
  previous_script_token: string | null;
  token_rotated_at: string | null;
  script_verified_at: string | null;
  settings: Record<string, unknown>;
  active: boolean;
  created_at: string;
}

export interface Plan {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
  description: string;
  description_ar?: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: {
    max_domains: number;
    max_events_per_day_per_domain: number;
    max_events_per_month_per_domain: number;
    max_analysis_runs_per_domain_per_month: number;
    ai_analysis_interval_hours: number;
    data_retention_days: number;
    chatbot_enabled: boolean;
    website_chatbot_enabled: boolean;
  };
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: "active" | "cancelled" | "expired" | "paused";
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  plan: Plan;
}

export interface Notification {
  id: number;
  user_id: number;
  domain_id: number | null;
  type: string;
  title: string;
  body: string;
  action_url: string | null;
  channel: "in_app" | "email" | "both";
  email_sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface AudienceSegment {
  id: number;
  domain_id: number;
  name: string;
  description: string;
  rules: Record<string, unknown>;
  visitor_count: number;
  color: string;
  created_at: string;
}

export interface AiSuggestion {
  id: number;
  domain_id: number;
  text: string;
  category: "audience" | "marketing" | "ux" | "conversion";
  priority: "high" | "medium" | "low";
  is_dismissed: boolean;
  created_at: string;
}

export interface UxScore {
  id: number;
  domain_id: number;
  score: number;
  breakdown: {
    load_speed: number;
    error_rate: number;
    rage_click_rate: number;
    funnel_completion: number;
    avg_session_duration: number;
  };
  calculated_at: string;
}

export interface UxIssue {
  id: number;
  domain_id: number;
  session_id: string;
  visitor_id: string;
  type: "js_error" | "dead_click" | "rage_click" | "broken_link" | "hesitation" | "form_abandon";
  url: string;
  element_selector: string | null;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Pipeline {
  id: number;
  domain_id: number;
  name: string;
  description: string | null;
  created_at: string;
  steps: PipelineStep[];
}

export interface PipelineStep {
  id: number;
  pipeline_id: number;
  name: string;
  url_pattern: string;
  order: number;
  created_at: string;
}

export interface Webhook {
  id: number;
  domain_id: number;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export interface ExportJob {
  id: number;
  user_id: number;
  domain_id: number;
  type: string;
  format: "csv" | "excel";
  status: "pending" | "processing" | "done" | "failed";
  file_path: string | null;
  created_at: string;
}

export interface SharedReport {
  id: number;
  domain_id: number;
  user_id: number;
  token: string;
  label: string;
  allowed_pages: string[] | null;
  expires_at: string | null;
  created_at: string;
}

export interface AnalyticsOverview {
  visitors: number;
  sessions: number;
  avg_duration_seconds: number;
  bounce_rate: number;
  pageviews: number;
  trend: Array<{ date: string; visitors: number; sessions: number }>;
  top_pages: Array<{ url: string; views: number }>;
  countries: Array<{ country: string; visitors: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
}

export interface AlertRule {
  id: number;
  domain_id: number;
  type: "traffic_drop" | "error_spike" | "quota_warning" | "score_drop";
  threshold: Record<string, unknown>;
  channel: "in_app" | "email" | "both";
  is_active: boolean;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  mrr: number;
  active_subscriptions: number;
  total_events_today: number;
  new_signups_chart: Array<{ date: string; count: number }>;
  revenue_chart: Array<{ date: string; amount: number }>;
  top_plans: Array<{ name: string; count: number }>;
}

export interface ThemeSettings {
  brand_primary: string;
  brand_secondary: string;
  brand_accent: string;
  platform_name: string;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  default_locale: "en" | "ar";
  default_appearance: "light" | "dark" | "system";
  font_arabic: string;
  font_latin: string;
  border_radius: "sharp" | "rounded" | "pill";
  sidebar_style: "expanded" | "collapsed" | "floating";
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
