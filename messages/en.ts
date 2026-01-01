/**
 * English translations for LEXIA
 */
export const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    back: "Back",
    next: "Next",
    submit: "Submit",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    close: "Close",
    settingSaved: "Setting saved",
    failedToLoad: "Failed to load",
    failedToUpdate: "Failed to update",
  },

  // Navigation & Layout
  nav: {
    dashboard: "Dashboard",
    courses: "Courses",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
  },

  // Settings Page
  settings: {
    title: "Settings",
    subtitle: "Manage your preferences and notifications",
    
    // Appearance
    appearance: "Appearance",
    appearanceDesc: "Customize how LEXIA looks on your device",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    currentlyUsing: "Currently using:",
    mode: "mode",
    
    // Language & Region
    languageRegion: "Language & Region",
    languageRegionDesc: "Set your preferred language and timezone",
    language: "Language",
    languageDesc: "This will be used for course content and interface text",
    timezone: "Timezone",
    timezoneDesc: "Used for scheduling lessons and reminders",
    
    // Notifications
    notifications: "Notifications",
    notificationsDesc: "Manage how you receive updates from LEXIA",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc: "Receive important updates via email",
    lessonReminders: "Lesson Reminders",
    lessonRemindersDesc: "Get reminders to complete your daily lessons",
    learningProgress: "Learning Progress Notifications",
    learningProgressDesc: "Receive updates about your learning achievements",
    notificationPrefSaved: "Notification preference saved",
    failedToUpdatePref: "Failed to update preference",
    
    // Security
    security: "Security",
    securityDesc: "Manage your password and account security",
    completeProfileFirst: "Please complete your profile first (name is required)",
  },

  // Password Change Form
  passwordChange: {
    currentPassword: "Current Password",
    currentPasswordPlaceholder: "Enter your current password",
    newPassword: "New Password",
    newPasswordPlaceholder: "Enter your new password",
    confirmNewPassword: "Confirm New Password",
    confirmPasswordPlaceholder: "Re-enter your new password",
    changePassword: "Change Password",
    changing: "Changing...",
    
    // Password requirements  
    passwordStrength: "Password strength:",
    atLeast8Chars: "At least 8 characters",
    oneUppercase: "One uppercase letter",
    oneLowercase: "One lowercase letter",
    oneNumber: "One number",
    
    // Strength labels
    tooWeak: "Too weak",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
    
    // Messages
    passwordChanged: "Password changed successfully!",
    passwordChangedDesc: "You will be logged out. Please login with your new password.",
    incorrectPassword: "Incorrect password",
    incorrectPasswordDesc: "The current password you entered is incorrect.",
    sessionExpired: "Session expired",
    sessionExpiredDesc: "Please login again to change your password.",
    failedToChange: "Failed to change password",
  },

  // Dashboard Page
  dashboard: {
    welcomeBack: "Welcome back, {name}!",
    readyToContinue: "Ready to continue your learning journey?",
    browseCourses: "Browse Courses",
    
    // Stats
    currentStreak: "Current Streak",
    days: "days",
    bestStreak: "Best: {count} days",
    startStreak: "Start your streak",
    
    completedLessons: "Completed Lessons",
    remaining: "{count} remaining",
    
    studyTime: "Study Time",
    totalTimeInvested: "Total time invested",
    
    averageScore: "Average Score",
    acrossAllQuizzes: "Across all quizzes",
    
    // My Courses
    myCourses: "My Courses",
    enrolledInCourses: "You are enrolled in {count} courses.",
    goToMyCourses: "Go to My Courses",
    noActiveCourses: "No active courses.",
    exploreCatalog: "Explore Catalog",
    viewAll: "View all",
    
    // Pro Welcome Banner
    welcomeToPro: "Welcome to Pro!",
    proWelcomeMessage: "You've unlocked unlimited AI features. Enjoy your premium learning experience!",
    rolePlaySessions: "{count} Role Play Sessions",
    flashcardDecks: "{count} Flashcard Decks",
    grammarExercises: "{count} Grammar Exercises",
    prioritySupport: "Priority Support",
    
    // AI Usage Section
    aiUsageThisMonth: "AI Usage This Month",
    resetsInDays: "Resets in {count} days",
    proBadge: "Pro",
    quotaExceededAlert: "You have used all your quota for {feature} this month. Upgrade to Pro to continue!",
    quotaExceededTotal: "You have used all your Total AI Requests this month.",
    quotaAlmostOut: "Almost out",
    quotaDepleted: "Depleted",
    unableToLoadQuota: "Unable to load quota information.",
    retry: "Retry",
    upgradeToProCTA: "Upgrade to Pro",
    upgradeToProDesc: "Get 3-5x higher quotas and exclusive features",
    upgradeBtn: "Upgrade",
    
    // AI Feature Labels (Unified)
    rolePlay: "Role Play",
    flashcardDecksLabel: "Flashcard Decks",
    grammarExercisesLabel: "Grammar Exercises",
    customMaterials: "Custom Materials",
    totalAiRequests: "Total AI Requests",
    
    // Learning Path
    learningPath: "Learning Path",
    yourLearningPath: "Your Learning Path",
    startLearningJourney: "Start Your Learning Journey",
    overallProgress: "Overall Progress",
    coursesCompletedInfo: "{completed} of {total} courses completed",
    pathCompleted: "Path Completed! 🎉",
    viewAchievements: "View Achievements",
    continueLearning: "Continue Learning",
    startThisPath: "Start This Path",
    recommendedForYou: "Recommended for You",
    estimatedHours: "{hours}h estimated",
    chooseStructuredPath: "Choose a structured learning path to guide your English learning journey.",
    browseLearningPaths: "Browse Learning Paths",
    currently: "Currently: {title}",
    
    // Recent Activity
    recentActivity: "Recent Activity",
    noRecentActivity: "No recent activity. Start a lesson today!",
    score: "Score",
    
    // Weekly Goals
    weeklyGoals: "Weekly Goals",
    noActiveGoals: "No active goals for this week.",
    
    // Errors
    failedToLoadDashboard: "Failed to load dashboard data",
  },

  // Profile Page
  profile: {
    title: "Profile Settings",
    subtitle: "Manage your account information and preferences",
    
    // Overview
    overview: "Profile Overview",
    overviewDesc: "Your public profile information",
    currentLevel: "Current Level:",
    retakeTest: "Retake Test",
    takePlacementTest: "Take Placement Test",
    uploadPhoto: "Upload Photo",
    recommended: "Recommended: Square image, at least 200x200px",
    maxSize: "Max size: 5MB • Formats: JPG, PNG, GIF, WebP",
    
    // Subscription
    subscription: "Subscription Plan",
    subscriptionDesc: "Manage your billing and subscription",
    freePlan: "Free Plan",
    proPlan: "Pro Plan",
    active: "Active",
    upgradeToUnlock: "Upgrade to unlock unlimited usage and AI features.",
    renewsOn: "Your plan renews on {date}",
    upgradeToPro: "Upgrade to Pro",
    manageSubscription: "Manage Subscription",
    premiumFeaturesUnlocked: "Premium Features Unlocked",
    prioritySupportLabel: "Priority Support",
    
    // AI Usage/Quota
    aiFeaturesQuota: "AI Features Quota",
    aiRoleplaySessions: "{count} AI Role Play Sessions/month",
    aiFlashcardDecks: "{count} AI Flashcard Decks/month",
    aiGrammarExercises: "{count} AI Grammar Exercises/month",
    
    // Edit Profile
    editProfile: "Edit Profile",
    editProfileDesc: "Update your personal information",
    firstName: "First Name",
    lastName: "Last Name",
    bio: "Bio",
    bioDesc: "Brief description about yourself (max 500 characters)",
    email: "Email",
    phone: "Phone Number",
    phoneDesc: "10-20 digits, optionally starting with +",
    timezone: "Timezone",
    language: "Language",
    selectTimezone: "Select timezone",
    selectLanguage: "Select language",
    placeholderFirstName: "John",
    placeholderLastName: "Doe",
    placeholderBio: "Tell us about yourself...",
    placeholderPhone: "+1234567890",
    saveChanges: "Save Changes",
    saving: "Saving...",
    
    // Validation
    firstNameMax: "First name must be less than 100 characters",
    lastNameMax: "Last name must be less than 100 characters",
    bioMax: "Bio must be less than 500 characters",
    phoneInvalid: "Phone must be 10-20 digits, optionally starting with +",
    languageLength: "Language code must be 2 characters",

    // AI Features Quota (Profile)
    resetsOn: "Resets on {date}",
    totalAiRequests: "Total AI Requests",
    quotaLimitReached: "Quota Limit Reached",
    quotaLimitReachedDesc: "You have used all your AI requests for this billing period. Upgrade your plan or wait until {date}.",
    criticalQuotaWarning: "Critical Quota Warning",
    criticalQuotaWarningDesc: "You are at 95%+ of your monthly AI usage limit. Consider upgrading to Pro.",
    quotaWarning: "Quota Warning",
    quotaWarningDesc: "You are approaching your monthly AI usage limit (80%+).",

    profileUpdated: "Profile updated successfully!",
    failedToUpdateProfile: "Failed to update profile. Please try again.",
    failedToLoadProfile: "Failed to load profile",
    failedToOpenPortal: "Failed to open billing portal",
    
    // Learning Goal
    learningGoal: "Learning Goal",
  },
} as const;

export type Messages = typeof en;
