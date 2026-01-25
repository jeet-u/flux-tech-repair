/**
 * Configuration Types for YAML-based site configuration
 *
 * These types match the structure of config/site.yaml
 */

// =============================================================================
// Site Basic Configuration
// =============================================================================

export interface SiteBasicConfig {
  title: string;
  alternate?: string;
  subtitle?: string;
  name: string;
  description?: string;
  avatar?: string;
  showLogo?: boolean;
  author?: string;
  url: string;
  startYear?: number;
  keywords?: string[];
}

// =============================================================================
// Featured Content
// =============================================================================

export interface FeaturedCategory {
  link: string;
  image: string;
  label?: string;
  description?: string;
}

export interface FeaturedSeriesLinks {
  github?: string;
  rss?: string;
  chrome?: string;
  docs?: string;
}

/**
 * Single featured series configuration
 */
export interface FeaturedSeriesItem {
  /** URL path for this series (e.g., 'weekly' → /weekly) */
  slug: string;
  /** Category name this series is based on */
  categoryName: string;
  /** Short label for sidebar/navigation */
  label?: string;
  /** Whether this series is enabled */
  enabled?: boolean;
  /** Full name for page title */
  fullName?: string;
  /** Series description (supports markdown) */
  description?: string;
  /** Cover image path */
  cover?: string;
  /** Navigation icon (Iconify format) */
  icon?: string;
  /** Whether to highlight latest post on home page */
  highlightOnHome?: boolean;
  /** Related links */
  links?: FeaturedSeriesLinks;
}

/**
 * @deprecated Use FeaturedSeriesItem instead
 */
export type FeaturedSeries = FeaturedSeriesItem;

// =============================================================================
// Social Configuration
// =============================================================================

export interface SocialPlatform {
  url: string;
  icon: string;
  color: string;
}

export type SocialConfig = Record<string, SocialPlatform>;

// =============================================================================
// Friends Configuration
// =============================================================================

export interface FriendLink {
  site: string;
  url: string;
  owner: string;
  desc: string;
  image: string;
  color?: string;
}

export interface FriendsIntro {
  title: string;
  subtitle?: string;
  applyTitle?: string;
  applyDesc?: string;
  exampleYaml?: string;
}

export interface FriendsConfig {
  intro: FriendsIntro;
  data: FriendLink[];
}

// =============================================================================
// Announcements
// =============================================================================

export interface AnnouncementLink {
  url: string;
  text?: string;
  external?: boolean;
}

export interface AnnouncementConfig {
  id: string;
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success' | 'important';
  publishDate?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
  link?: AnnouncementLink;
  color?: string;
}

// =============================================================================
// Content Processing Configuration
// =============================================================================

export interface ContentConfig {
  addBlankTarget: boolean;
  smoothScroll: boolean;
  addHeadingLevel: boolean;
  enhanceCodeBlock: boolean;
  enableCodeCopy: boolean;
  enableCodeFullscreen: boolean;
  enableLinkEmbed: boolean;
  enableTweetEmbed: boolean;
  enableOGPreview: boolean;
  previewCacheTime: number;
  lazyLoadEmbeds: boolean;
}

// =============================================================================
// Navigation
// =============================================================================

export interface RouterItem {
  name?: string;
  path?: string;
  icon?: string;
  children?: RouterItem[];
}

// =============================================================================
// Comment Configuration
// =============================================================================

export type CommentProvider = 'remark42' | 'giscus' | 'waline' | 'none';

export interface Remark42Config {
  host: string;
  siteId: string;
}

export type GiscusBooleanString = '0' | '1';
export interface GiscusConfig {
  repo: `${string}/${string}`; // owner/repo format
  repoId: string;
  category?: string;
  categoryId?: string;
  mapping?: 'url' | 'title' | 'og:title' | 'specific' | 'number' | 'pathname';
  term?: string; // Used when mapping is 'specific' or 'number'
  strict?: GiscusBooleanString;
  reactionsEnabled?: GiscusBooleanString;
  emitMetadata?: GiscusBooleanString;
  inputPosition?: 'top' | 'bottom';
  lang?: string;
  host?: string; // Custom giscus host (for self-hosted)
  theme?: string;
  loading?: 'lazy' | 'eager';
}

export type WalineMeta = 'nick' | 'mail' | 'link';
export type WalineLoginStatus = 'enable' | 'disable' | 'force';
export type WalineCommentSorting = 'latest' | 'oldest' | 'hottest';
export type WalineEmojiPresets = `//${string}` | `http://${string}` | `https://${string}`;

export interface WalineEmojiInfo {
  /**
   * Emoji name show on tab
   */
  name: string;
  /**
   * Current folder link
   */
  folder?: string;
  /**
   * Common prefix of Emoji icons
   */
  prefix?: string;
  /**
   * Type of Emoji icons, will be regarded as file extension
   */
  type?: string;
  /**
   * Emoji icon show on tab
   */
  icon: string;
  /**
   * Emoji image list
   */
  items: string[];
}

export interface WalineConfig {
  /**
   * Waline server address (required)
   */
  serverURL: string;

  /**
   * Display language
   * @default 'zh-CN'
   */
  lang?: string;

  /**
   * Darkmode support
   * @default 'html.dark'
   */
  dark?: string | boolean;

  /**
   * Reviewer attributes
   * @default ['nick', 'mail', 'link']
   */
  meta?: WalineMeta[];

  /**
   * Required fields
   * @default []
   */
  requiredMeta?: WalineMeta[];

  /**
   * Login mode status
   * @default 'enable'
   */
  login?: WalineLoginStatus;

  /**
   * Comment word limit (0 = no limit)
   * @default 0
   */
  wordLimit?: number | [number, number];

  /**
   * Number of comments per page
   * @default 10
   */
  pageSize?: number;

  /**
   * Image upload feature
   * @default false
   */
  imageUploader?: boolean;

  /**
   * Code highlighting
   * @default true
   */
  highlighter?: boolean;

  /**
   * LaTeX rendering
   * @default false
   */
  texRenderer?: boolean;

  /**
   * Search feature
   * @default false
   */
  search?: boolean;

  /**
   * Article reaction
   * @default false
   */
  reaction?: boolean | string[];

  /**
   * reCAPTCHA v3 client key
   */
  recaptchaV3Key?: string;

  /**
   * Turnstile client key
   */
  turnstileKey?: string;

  /**
   * Emoji configuration
   * @default ['//unpkg.com/@waline/emojis@1.2.0/weibo']
   */
  emoji?: (WalineEmojiInfo | WalineEmojiPresets)[] | boolean;

  /**
   * Sorting method for comment list
   * @default 'latest'
   */
  commentSorting?: WalineCommentSorting;

  /**
   * Whether hide copyright in footer
   * @default false
   */
  noCopyright?: boolean;

  /**
   * Comment count support
   * @default true
   */
  comment?: string | boolean;

  /**
   * Pageview count support
   * @default true
   */
  pageview?: string | boolean;

  /**
   * Custom display language
   */
  locale?: Record<string, string>;
}

export interface CommentConfig {
  provider?: CommentProvider;
  remark42?: Remark42Config;
  giscus?: GiscusConfig;
  waline?: WalineConfig;
}

// =============================================================================
// Analytics Configuration
// =============================================================================

export interface UmamiConfig {
  enabled: boolean;
  id: string;
  endpoint: string;
}

export interface AnalyticsConfig {
  umami?: UmamiConfig;
}

// =============================================================================
// Christmas/Seasonal Features
// =============================================================================

export interface ChristmasFeatures {
  snowfall: boolean;
  christmasColorScheme: boolean;
  christmasCoverDecoration: boolean;
  christmasHat: boolean;
  readingTimeSnow: boolean;
}

export interface SnowfallConfig {
  speed: number;
  intensity: number;
  mobileIntensity: number;
  maxLayers: number;
  maxIterations: number;
  mobileMaxLayers: number;
  mobileMaxIterations: number;
}

export interface ChristmasConfig {
  enabled: boolean;
  features: ChristmasFeatures;
  snowfall: SnowfallConfig;
}

// =============================================================================
// Root Configuration Type
// =============================================================================

export interface SiteYamlConfig {
  site: SiteBasicConfig;
  featuredCategories?: FeaturedCategory[];
  /** Featured series configuration - supports array (multiple series) or single object (legacy) */
  featuredSeries?: FeaturedSeriesItem[] | FeaturedSeriesItem;
  social?: SocialConfig;
  friends?: FriendsConfig;
  announcements?: AnnouncementConfig[];
  content?: ContentConfig;
  navigation?: RouterItem[];
  comment?: CommentConfig;
  analytics?: AnalyticsConfig;
  categoryMap?: Record<string, string>; // TODO: i18n, now use eg: { 'Essays': 'life' }
  christmas?: ChristmasConfig;
}
