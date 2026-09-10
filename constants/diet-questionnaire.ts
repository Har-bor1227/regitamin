import type {
  DietQuestion,
} from '@/types/diet-questionnaire';

export const DIET_QUESTIONNAIRE_VERSION = 1;

export const DIET_QUESTIONNAIRE_QUESTIONS: DietQuestion[] = [
  {
    id: 'goal',
    type: 'single',
    title: 'مهم‌ترین هدفت از گرفتن رژیم چیه؟',
    description:
      'هدفت رو انتخاب کن تا برنامه بر اساس اولویت اصلیت تنظیم بشه.',
    required: true,
    options: [
      {
        value: 'weight_loss',
        label: 'کاهش وزن',
        description: 'کم کردن وزن و رسیدن به وزن دلخواه',
      },
      {
        value: 'weight_gain',
        label: 'افزایش وزن',
        description: 'افزایش وزن به شکل اصولی',
      },
      {
        value: 'weight_maintenance',
        label: 'حفظ وزن',
        description: 'حفظ وزن فعلی و داشتن تغذیه منظم',
      },
      {
        value: 'fitness',
        label: 'تناسب اندام',
        description: 'بهبود فرم بدن و سبک زندگی',
      },
      {
        value: 'healthy_eating',
        label: 'تغذیه سالم‌تر',
        description: 'ساختن عادات غذایی بهتر',
      },
    ],
  },

  {
    id: 'age',
    type: 'number',
    title: 'چند سالته؟',
    description:
      'سن برای تنظیم بهتر برنامه غذایی اهمیت داره.',
    required: true,
    min: 13,
    max: 100,
    step: 1,
    unit: 'سال',
    placeholder: 'مثلاً ۲۷',
  },

  {
    id: 'gender',
    type: 'single',
    title: 'جنسیتت چیه؟',
    description:
      'این اطلاعات برای شخصی‌سازی بهتر برنامه استفاده می‌شه.',
    required: true,
    options: [
      {
        value: 'female',
        label: 'خانم',
      },
      {
        value: 'male',
        label: 'آقا',
      },
    ],
  },

  {
    id: 'height',
    type: 'number',
    title: 'قدت چند سانتی‌متره؟',
    description:
      'قد فعلیت رو بدون کفش وارد کن.',
    required: true,
    min: 100,
    max: 230,
    step: 1,
    unit: 'سانتی‌متر',
    placeholder: 'مثلاً ۱۷۲',
  },

  {
    id: 'currentWeight',
    type: 'number',
    title: 'وزن فعلیت چقدره؟',
    description:
      'وزن فعلی رو به کیلوگرم وارد کن.',
    required: true,
    min: 25,
    max: 300,
    step: 0.1,
    unit: 'کیلوگرم',
    placeholder: 'مثلاً ۸۲',
  },

  {
    id: 'targetWeight',
    type: 'number',
    title: 'به چه وزنی می‌خوای برسی؟',
    description:
      'یک وزن هدف واقع‌بینانه وارد کن.',
    required: true,
    min: 25,
    max: 300,
    step: 0.1,
    unit: 'کیلوگرم',
    placeholder: 'مثلاً ۷۰',
  },

  {
    id: 'dietHistory',
    type: 'single',
    title: 'قبلاً رژیم گرفتی؟',
    description:
      'این اطلاعات کمک می‌کنه تجربه قبلی رژیمت رو در نظر بگیریم.',
    required: true,
    options: [
      {
        value: 'never',
        label: 'نه، تا حالا رژیم نگرفتم',
      },
      {
        value: 'once',
        label: 'بله، یک بار',
      },
      {
        value: 'several',
        label: 'بله، چند بار',
      },
      {
        value: 'many',
        label: 'رژیم‌های مختلف زیادی امتحان کردم',
      },
    ],
  },

  {
    id: 'activityLevel',
    type: 'single',
    title: 'میزان فعالیت روزانه‌ات چقدره؟',
    description:
      'نزدیک‌ترین گزینه به سبک زندگی فعلیت رو انتخاب کن.',
    required: true,
    options: [
      {
        value: 'sedentary',
        label: 'خیلی کم',
        description: 'بیشتر روز رو نشسته هستم',
      },
      {
        value: 'light',
        label: 'کم',
        description: 'کمی پیاده‌روی یا فعالیت روزانه دارم',
      },
      {
        value: 'moderate',
        label: 'متوسط',
        description: 'چند روز در هفته فعالیت یا ورزش دارم',
      },
      {
        value: 'high',
        label: 'زیاد',
        description: 'تقریباً بیشتر روزها ورزش یا فعالیت دارم',
      },
      {
        value: 'professional',
        label: 'خیلی زیاد',
        description: 'ورزش حرفه‌ای یا فعالیت بدنی سنگین',
      },
    ],
  },

  {
    id: 'foodAllergies',
    type: 'multi',
    title: 'به ماده غذایی خاصی حساسیت یا عدم تحمل داری؟',
    description:
      'اگر موردی نداری، گزینه «ندارم» رو انتخاب کن.',
    required: true,
    multiple: true,
    options: [
      {
        value: 'none',
        label: 'ندارم',
      },
      {
        value: 'milk',
        label: 'شیر و لبنیات',
      },
      {
        value: 'egg',
        label: 'تخم‌مرغ',
      },
      {
        value: 'nuts',
        label: 'مغزها',
      },
      {
        value: 'gluten',
        label: 'گلوتن',
      },
      {
        value: 'seafood',
        label: 'غذاهای دریایی',
      },
      {
        value: 'other',
        label: 'مورد دیگر',
      },
    ],
  },

  {
    id: 'medicalConditions',
    type: 'multi',
    title: 'شرایط یا بیماری زمینه‌ای خاصی داری؟',
    description:
      'در صورت نداشتن بیماری، «موردی ندارم» رو انتخاب کن.',
    required: true,
    multiple: true,
    options: [
      {
        value: 'none',
        label: 'موردی ندارم',
      },
      {
        value: 'diabetes',
        label: 'دیابت',
      },
      {
        value: 'thyroid',
        label: 'مشکلات تیروئید',
      },
      {
        value: 'pcos',
        label: 'PCOS',
      },
      {
        value: 'hypertension',
        label: 'فشار خون',
      },
      {
        value: 'fatty_liver',
        label: 'کبد چرب',
      },
      {
        value: 'digestive',
        label: 'مشکلات گوارشی',
      },
      {
        value: 'cardiovascular',
        label: 'مشکلات قلبی',
      },
      {
        value: 'other',
        label: 'مورد دیگر',
      },
    ],
  },

  {
    id: 'medications',
    type: 'text',
    title: 'داروی خاصی مصرف می‌کنی؟',
    description:
      'نام داروها یا مکمل‌هایی که به‌صورت منظم مصرف می‌کنی رو بنویس. اگر نداری، بنویس «ندارم».',
    required: true,
    maxLength: 1000,
    placeholder:
      'مثلاً لووتیروکسین، ویتامین D یا «ندارم»',
    showWhen: {
      questionId: 'medicalConditions',
      values: [
        'diabetes',
        'thyroid',
        'pcos',
        'hypertension',
        'fatty_liver',
        'digestive',
        'cardiovascular',
        'other',
      ],
    },
  },

  {
    id: 'foodPreferences',
    type: 'text',
    title: 'چه غذاهایی رو دوست نداری یا معمولاً نمی‌خوری؟',
    description:
      'هر غذایی که دوست نداری، نمی‌خوری یا ترجیح می‌دی در برنامه نباشه رو بنویس.',
    required: false,
    maxLength: 1000,
    placeholder:
      'مثلاً ماهی، بادمجان، قارچ و...',
  },

  {
    id: 'mealPattern',
    type: 'single',
    title: 'الگوی وعده‌های غذاییت معمولاً چطوره؟',
    description:
      'نزدیک‌ترین گزینه به حالت معمولت رو انتخاب کن.',
    required: true,
    options: [
      {
        value: 'one_two',
        label: '۱ تا ۲ وعده',
      },
      {
        value: 'three',
        label: '۳ وعده',
      },
      {
        value: 'four',
        label: '۴ وعده',
      },
      {
        value: 'five_plus',
        label: '۵ وعده یا بیشتر',
      },
      {
        value: 'irregular',
        label: 'نامنظم',
      },
    ],
  },

  {
    id: 'cookingTime',
    type: 'single',
    title: 'معمولاً چقدر برای آماده‌کردن غذا وقت داری؟',
    description:
      'برنامه باید با زندگی واقعی تو قابل اجرا باشه.',
    required: true,
    options: [
      {
        value: 'very_little',
        label: 'خیلی کم',
        description: 'غذا باید سریع و ساده باشه',
      },
      {
        value: 'little',
        label: 'کم',
      },
      {
        value: 'moderate',
        label: 'متوسط',
      },
      {
        value: 'high',
        label: 'زیاد',
        description: 'برای آماده‌سازی غذا زمان کافی دارم',
      },
    ],
  },
];

export const DIET_QUESTIONNAIRE_TOTAL_STEPS =
  DIET_QUESTIONNAIRE_QUESTIONS.length;

export function getDietQuestionById(
  id: string,
): DietQuestion | undefined {
  return DIET_QUESTIONNAIRE_QUESTIONS.find(
    (question) => question.id === id,
  );
}