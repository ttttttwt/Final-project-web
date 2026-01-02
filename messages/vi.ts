/**
 * Vietnamese translations for LEXIA
 */

export const vi = {
  common: {
    save: "Lưu",
    cancel: "Hủy",
    loading: "Đang tải...",
    error: "Lỗi",
    success: "Thành công",
    back: "Quay lại",
    next: "Tiếp theo",
    submit: "Gửi",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    confirm: "Xác nhận",
    close: "Đóng",
    settingSaved: "Đã lưu cài đặt",
    failedToLoad: "Không thể tải",
    failedToUpdate: "Không thể cập nhật",
  },

  // Navigation & Layout
  nav: {
    dashboard: "Tổng quan",
    courses: "Khóa học",
    profile: "Hồ sơ",
    settings: "Cài đặt",
    logout: "Đăng xuất",
  },

  // Settings Page
  settings: {
    title: "Cài đặt",
    subtitle: "Quản lý tùy chọn và thông báo của bạn",
    
    // Appearance
    appearance: "Giao diện",
    appearanceDesc: "Tùy chỉnh giao diện LEXIA trên thiết bị của bạn",
    theme: "Chủ đề",
    themeLight: "Sáng",
    themeDark: "Tối",
    themeSystem: "Hệ thống",
    currentlyUsing: "Đang sử dụng:",
    mode: "",
    
    // Language & Region
    languageRegion: "Ngôn ngữ & Khu vực",
    languageRegionDesc: "Đặt ngôn ngữ và múi giờ ưa thích của bạn",
    language: "Ngôn ngữ",
    languageDesc: "Sẽ được sử dụng cho nội dung khóa học và giao diện",
    timezone: "Múi giờ",
    timezoneDesc: "Dùng để lên lịch bài học và nhắc nhở",
    
    // Notifications
    notifications: "Thông báo",
    notificationsDesc: "Quản lý cách bạn nhận thông tin từ LEXIA",
    emailNotifications: "Thông báo Email",
    emailNotificationsDesc: "Nhận các cập nhật quan trọng qua email",
    lessonReminders: "Nhắc nhở bài học",
    lessonRemindersDesc: "Nhận nhắc nhở để hoàn thành bài học hàng ngày",
    learningProgress: "Thông báo tiến độ học tập",
    learningProgressDesc: "Nhận cập nhật về thành tích học tập của bạn",
    notificationPrefSaved: "Đã lưu tùy chọn thông báo",
    failedToUpdatePref: "Không thể cập nhật tùy chọn",
    
    // Security
    security: "Bảo mật",
    securityDesc: "Quản lý mật khẩu và bảo mật tài khoản",
    completeProfileFirst: "Vui lòng hoàn thành hồ sơ trước (cần có tên)",
  },

  // Password Change Form
  passwordChange: {
    currentPassword: "Mật khẩu hiện tại",
    currentPasswordPlaceholder: "Nhập mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    newPasswordPlaceholder: "Nhập mật khẩu mới",
    confirmNewPassword: "Xác nhận mật khẩu mới",
    confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
    changePassword: "Đổi mật khẩu",
    changing: "Đang đổi...",
    
    // Password requirements  
    passwordStrength: "Độ mạnh mật khẩu:",
    atLeast8Chars: "Ít nhất 8 ký tự",
    oneUppercase: "Một chữ cái viết hoa",
    oneLowercase: "Một chữ cái viết thường",
    oneNumber: "Một số",
    
    // Strength labels
    tooWeak: "Quá yếu",
    weak: "Yếu",
    fair: "Trung bình",
    good: "Tốt",
    strong: "Mạnh",
    
    // Messages
    passwordChanged: "Đổi mật khẩu thành công!",
    passwordChangedDesc: "Bạn sẽ được đăng xuất. Vui lòng đăng nhập lại với mật khẩu mới.",
    incorrectPassword: "Mật khẩu không đúng",
    incorrectPasswordDesc: "Mật khẩu hiện tại bạn nhập không chính xác.",
    sessionExpired: "Phiên đã hết hạn",
    sessionExpiredDesc: "Vui lòng đăng nhập lại để đổi mật khẩu.",
    failedToChange: "Không thể đổi mật khẩu",
  },

  // Dashboard Page
  dashboard: {
    welcomeBack: "Chào mừng trở lại, {name}!",
    readyToContinue: "Sẵn sàng tiếp tục hành trình học tập?",
    browseCourses: "Xem khóa học",
    
    // Stats
    currentStreak: "Chuỗi hiện tại",
    days: "ngày",
    bestStreak: "Kỷ lục: {count} ngày",
    startStreak: "Bắt đầu chuỗi của bạn",
    
    completedLessons: "Bài học đã hoàn thành",
    remaining: "Còn {count} bài",
    
    studyTime: "Thời gian học",
    totalTimeInvested: "Tổng thời gian đã đầu tư",
    
    averageScore: "Điểm trung bình",
    acrossAllQuizzes: "Trên tất cả bài kiểm tra",
    
    // My Courses
    myCourses: "Khóa học của tôi",
    enrolledInCourses: "Bạn đang tham gia {count} khóa học.",
    goToMyCourses: "Đi đến khóa học",
    noActiveCourses: "Không có khóa học nào.",
    exploreCatalog: "Khám phá danh mục",
    viewAll: "Xem tất cả",
    
    // Pro Welcome Banner
    welcomeToPro: "Chào mừng đến Pro!",
    proWelcomeMessage: "Bạn đã mở khóa tính năng AI không giới hạn. Tận hưởng trải nghiệm học tập cao cấp!",
    rolePlaySessions: "{count} phiên Role Play",
    flashcardDecks: "{count} bộ Flashcard",
    grammarExercises: "{count} bài tập ngữ pháp",
    prioritySupport: "Hỗ trợ ưu tiên",
    
    // AI Usage Section
    aiUsageThisMonth: "Sử dụng AI trong tháng",
    resetsInDays: "Làm mới sau {count} ngày",
    proBadge: "Pro",
    quotaExceededAlert: "Bạn đã dùng hết hạn ngạch cho {feature} tháng này. Nâng cấp Pro để tiếp tục!",
    quotaExceededTotal: "Bạn đã dùng hết tổng số yêu cầu AI trong tháng này.",
    quotaAlmostOut: "Sắp hết",
    quotaDepleted: "Đã hết",
    unableToLoadQuota: "Không thể tải thông tin hạn ngạch.",
    retry: "Thử lại",
    upgradeToProCTA: "Nâng cấp lên Pro",
    upgradeToProDesc: "Nhận hạn ngạch cao hơn 3-5 lần và các tính năng độc quyền",
    upgradeBtn: "Nâng cấp",
    
    // AI Feature Labels (Unified)
    rolePlay: "Role Play",
    flashcardDecksLabel: "Bộ Flashcard",
    grammarExercisesLabel: "Bài tập ngữ pháp",
    customMaterials: "Tài liệu tùy chỉnh",
    totalAiRequests: "Tổng yêu cầu AI",
    
    // Learning Path
    learningPath: "Lộ trình học tập",
    yourLearningPath: "Lộ trình của bạn",
    startLearningJourney: "Bắt đầu hành trình học tập",
    overallProgress: "Tiến độ tổng thể",
    coursesCompletedInfo: "Đã hoàn thành {completed}/{total} khóa học",
    pathCompleted: "Đã hoàn thành lộ trình! 🎉",
    viewAchievements: "Xem thành tích",
    continueLearning: "Tiếp tục học",
    startThisPath: "Bắt đầu lộ trình này",
    recommendedForYou: "Gợi ý cho bạn",
    estimatedHours: "Dự kiến {hours} giờ",
    chooseStructuredPath: "Chọn một lộ trình học tập có cấu trúc để dẫn dắt hành trình học tiếng Anh của bạn.",
    browseLearningPaths: "Khám phá các lộ trình",
    currently: "Hiện tại: {title}",
    
    // Recent Activity
    recentActivity: "Hoạt động gần đây",
    noRecentActivity: "Không có hoạt động gần đây. Hãy bắt đầu bài học ngay hôm nay!",
    score: "Điểm",
    
    // Weekly Goals
    weeklyGoals: "Mục tiêu tuần",
    noActiveGoals: "Không có mục tiêu hoạt động trong tuần này.",
    
    // Errors
    failedToLoadDashboard: "Không thể tải dữ liệu tổng quan",
  },

  // Profile Page
  profile: {
    title: "Cài đặt hồ sơ",
    subtitle: "Quản lý thông tin tài khoản và tùy chọn của bạn",
    
    // Overview
    overview: "Tổng quan hồ sơ",
    overviewDesc: "Thông tin hồ sơ công khai của bạn",
    currentLevel: "Cấp độ hiện tại:",
    retakeTest: "Làm lại bài kiểm tra",
    takePlacementTest: "Làm bài kiểm tra xếp lớp",
    uploadPhoto: "Tải ảnh lên",
    recommended: "Khuyến nghị: Ảnh vuông, ít nhất 200x200px",
    maxSize: "Kích thước tối đa: 5MB • Định dạng: JPG, PNG, GIF, WebP",
    
    // Subscription
    subscription: "Gói đăng ký",
    subscriptionDesc: "Quản lý thanh toán và đăng ký",
    freePlan: "Gói miễn phí",
    proPlan: "Gói Pro",
    active: "Hoạt động",
    upgradeToUnlock: "Nâng cấp để mở khóa sử dụng không giới hạn và tính năng AI.",
    renewsOn: "Gói của bạn gia hạn vào {date}",
    upgradeToPro: "Nâng cấp lên Pro",
    manageSubscription: "Quản lý đăng ký",
    premiumFeaturesUnlocked: "Tính năng Premium đã mở khóa",
    prioritySupportLabel: "Hỗ trợ ưu tiên",
    
    // AI Usage/Quota
    aiFeaturesQuota: "Hạn ngạch tính năng AI",
    aiRoleplaySessions: "{count} phiên AI Role Play/tháng",
    aiFlashcardDecks: "{count} bộ Flashcard AI/tháng",
    aiGrammarExercises: "{count} bài tập ngữ pháp AI/tháng",
    
    // Edit Profile
    editProfile: "Chỉnh sửa hồ sơ",
    editProfileDesc: "Cập nhật thông tin cá nhân của bạn",
    firstName: "Tên",
    lastName: "Họ",
    bio: "Giới thiệu",
    bioDesc: "Mô tả ngắn về bản thân (tối đa 500 ký tự)",
    email: "Email",
    phone: "Số điện thoại",
    phoneDesc: "10-20 chữ số, có thể bắt đầu bằng +",
    timezone: "Múi giờ",
    language: "Ngôn ngữ",
    selectTimezone: "Chọn múi giờ",
    selectLanguage: "Chọn ngôn ngữ",
    placeholderFirstName: "Tên",
    placeholderLastName: "Họ",
    placeholderBio: "Giới thiệu về bản thân bạn...",
    placeholderPhone: "+84...",
    saveChanges: "Lưu thay đổi",
    saving: "Đang lưu...",
    
    // Validation
    firstNameMax: "Tên phải ít hơn 100 ký tự",
    lastNameMax: "Họ phải ít hơn 100 ký tự",
    bioMax: "Giới thiệu phải ít hơn 500 ký tự",
    phoneInvalid: "Số điện thoại phải từ 10-20 chữ số, có thể bắt đầu bằng +",
    languageLength: "Mã ngôn ngữ phải có 2 ký tự",

    // AI Features Quota (Profile)
    resetsOn: "Làm mới vào {date}",
    totalAiRequests: "Tổng yêu cầu AI",
    quotaLimitReached: "Đã hết hạn ngạch",
    quotaLimitReachedDesc: "Bạn đã sử dụng hết các yêu cầu AI cho kỳ thanh toán này. Nâng cấp gói của bạn hoặc đợi đến ngày {date}.",
    criticalQuotaWarning: "Cảnh báo hạn ngạch nghiêm trọng",
    criticalQuotaWarningDesc: "Bạn đã sử dụng hơn 95% hạn ngạch AI hàng tháng. Hãy cân nhắc nâng cấp lên Pro.",
    quotaWarning: "Cảnh báo hạn ngạch",
    quotaWarningDesc: "Bạn đang tiến gần đến giới hạn sử dụng AI hàng tháng (80%+).",

    profileUpdated: "Cập nhật hồ sơ thành công!",
    failedToUpdateProfile: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
    failedToLoadProfile: "Không thể tải hồ sơ",
    failedToOpenPortal: "Không thể mở cổng thanh toán",
    
    // Learning Goal
    learningGoal: "Mục tiêu học tập",
  },
  courses: {
    title: "Khóa học",
    subtitle: "Khám phá và đăng ký các khóa học tiếng Anh",
    searchPlaceholder: "Tìm kiếm khóa học...",
    filters: "Bộ lọc",
    enrollmentStatus: "Trạng thái đăng ký",
    allCourses: "Tất cả khóa học",
    joined: "Đã tham gia",
    notJoined: "Chưa tham gia",
    cefrLevel: "Cấp độ CEFR",
    sortBy: "Sắp xếp theo:",
    newestFirst: "Mới nhất",
    oldestFirst: "Cũ nhất",
    titleAZ: "Tiêu đề (A-Z)",
    titleZA: "Tiêu đề (Z-A)",
    showingResults: "Đang hiển thị {{count}} trên {{total}} khóa học",
    noCoursesFound: "Không tìm thấy khóa học nào phù hợp với tiêu chí của bạn.",
    clearFilters: "Xóa bộ lọc",
    viewDetail: "Xem chi tiết",
    continue: "Tiếp tục",
    continueLearning: "Tiếp tục học",
    enrollNow: "Đăng ký ngay",
    enrolling: "Đang đăng ký...",
    enrolledMessage: "Bạn đã đăng ký khóa học này",
    courseCurriculum: "Nội dung khóa học",
    noCurriculum: "Chưa có nội dung. Vui lòng quay lại sau!",
    backToCourses: "Quay lại Khóa học",
    takePlacementTest: "Làm bài kiểm tra xếp lớp",
    placementTestRequired: "Cần làm bài kiểm tra xếp lớp",
    placementTestRequiredDesc: "Để đảm bảo bạn nhận được lộ trình tốt nhất, hãy hoàn thành bài kiểm tra xếp lớp nhanh. Điều này giúp chúng tôi đề xuất khóa học phù hợp. Bạn không thể đăng ký khóa học mới cho đến khi hoàn thành bài này.",
    levelHigherWarning: "Khóa học này ở cấp độ {{courseLevel}}, cao hơn cấp độ hiện tại của bạn ({{userLevel}}).",
    levelHigherDesc: "Chúng tôi khuyên bạn nên bắt đầu với các khóa học ở cấp độ của mình.",
    enrollAnyway: "Vẫn đăng ký",
    successfullyEnrolled: "Đăng ký khóa học thành công!",
    accessAllLessons: "Bây giờ bạn có thể truy cập tất cả bài học.",
    mins: "phút",
    sections: "phần",
    lessons: "bài học",
    hours: "giờ tổng cộng",
    courseNotFound: "Không tìm thấy khóa học",
    courseNotFoundDesc: "Khóa học bạn tìm không tồn tại hoặc đã bị xóa."
  },
  progress: {
    title: "Tiến độ học tập",
    subtitle: "Theo dõi hành trình học tập và thành tích của bạn",
    lessonsCompleted: "Bài học đã hoàn thành",
    timeSpent: "Thời gian đã học",
    currentStreak: "Chuỗi ngày hiện tại",
    longestStreak: "Chuỗi ngày dài nhất",
    days: "ngày",
    activeToday: "Đã học hôm nay",
    learningActivity: "Hoạt động học tập",
    activityCalendar: "Lịch hoạt động",
    activeDaysLast30: "Số ngày hoạt động (30 ngày qua)",
    avgTimePerLesson: "Thời gian TB mỗi bài",
    totalActiveDays: "Tổng số ngày hoạt động",
    percentOfDays: "{{percent}}% số ngày"
  },
  lessons: {
    reading: "Đọc",
    listening: "Nghe",
    quiz: "Trắc nghiệm",
    speaking: "Nói",
    passage: "Bài đọc",
    keyVocabulary: "Từ vựng chính",
    comprehension: "Câu hỏi thấu hiểu",
    true: "Đúng",
    false: "Sai",
    explanation: "Giải thích",
    audioPlayer: "Bài tập nghe",
    transcript: "Bản văn",
    showTranscript: "Hiện bản văn",
    hideTranscript: "Ẩn bản văn",
    duration: "Thời lượng",
    quizHeader: "Trắc nghiệm",
    instructions: "Hướng dẫn",
    timeLimit: "Giới hạn thời gian",
    passingScore: "Điểm đạt",
    questions: "Câu hỏi",
    hint: "Gợi ý",
    points: "điểm",
    scenario: "Tình huống",
    aiRole: "Vai AI",
    speakingPractice: "Luyện nói",
    turns: "lượt",
    practicePrompts: "Gợi ý luyện tập",
    sampleAnswers: "Câu trả lời mẫu",
    targetGrammar: "Ngữ pháp mục tiêu",
    comingSoon: "Sắp ra mắt",
    comingSoonDesc: "Luyện nói tương tác với AI sẽ sớm ra mắt. Hiện tại, hãy tự luyện tập với các gợi ý này."
  },
};
