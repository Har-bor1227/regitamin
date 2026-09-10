import {
  requireAdmin,
} from '@/lib/admin-auth';

const WOO_API =
  process.env.WOOCOMMERCE_API_URL?.trim() || '';

const WOO_KEY =
  process.env.WOOCOMMERCE_CONSUMER_KEY?.trim() || '';

const WOO_SECRET =
  process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim() || '';

export type DeliveryStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'delivered';

export interface AdminOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  dateCreated: string;
  transactionId: string;
  customerId: number;
  customerPhone: string;
  customerName: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    total: string;
  }>;
  questionnaire: {
    sessionId: string;
    version: string;
    answers: Record<
      string,
      unknown
    >;
    completedAt: string;
  } | null;
  deliveryStatus: DeliveryStatus;
  pdf: {
    url: string;
    name: string;
  } | null;
}

function getAuthHeader() {
  if (
    !WOO_API ||
    !WOO_KEY ||
    !WOO_SECRET
  ) {
    throw new Error(
      'WooCommerce configuration is incomplete.',
    );
  }

  return `Basic ${Buffer.from(
    `${WOO_KEY}:${WOO_SECRET}`,
  ).toString('base64')}`;
}

function getMeta(
  metaData: any[],
  key: string,
) {
  const item =
    metaData.find(
      (entry) =>
        String(
          entry?.key || '',
        ) === key,
    );

  return item?.value ?? '';
}

function parseQuestionnaire(
  metaData: any[],
) {
  const rawAnswers =
    getMeta(
      metaData,
      '_regitamin_questionnaire_answers',
    );

  let answers:
    | Record<string, unknown>
    | null = null;

  try {
    const parsed =
      typeof rawAnswers === 'string'
        ? JSON.parse(
            rawAnswers,
          )
        : rawAnswers;

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      answers =
        parsed as Record<
          string,
          unknown
        >;
    }
  } catch {
    answers = null;
  }

  const sessionId =
    String(
      getMeta(
        metaData,
        '_regitamin_questionnaire_session',
      ) || '',
    );

  if (
    !sessionId &&
    !answers
  ) {
    return null;
  }

  return {
    sessionId,
    version:
      String(
        getMeta(
          metaData,
          '_regitamin_questionnaire_version',
        ) || '',
      ),
    answers: answers || {},
    completedAt:
      String(
        getMeta(
          metaData,
          '_regitamin_questionnaire_completed_at',
        ) || '',
      ),
  };
}

function parseDeliveryStatus(
  value: unknown,
): DeliveryStatus {
  if (
    value === 'preparing' ||
    value === 'ready' ||
    value === 'delivered'
  ) {
    return value;
  }

  return 'pending';
}

function mapOrder(
  order: any,
): AdminOrder {
  const metaData =
    Array.isArray(
      order?.meta_data,
    )
      ? order.meta_data
      : [];

  const customerPhone =
    String(
      order?.billing?.phone ||
        '',
    );

  const firstName =
    String(
      order?.billing?.first_name ||
        '',
    );

  const lastName =
    String(
      order?.billing?.last_name ||
        '',
    );

  const deliveryStatus =
    parseDeliveryStatus(
      getMeta(
        metaData,
        '_regitamin_delivery_status',
      ),
    );

const pdfUrl =
  String(
    getMeta(
      metaData,
      '_regitamin_diet_pdf_url',
    ) || '',
  );

const pdfName =
  String(
    getMeta(
      metaData,
      '_regitamin_diet_pdf_name',
    ) || '',
  );

const pdf =
  pdfUrl
    ? {
        url: pdfUrl,
        name:
          pdfName ||
          'فایل رژیم.pdf',
      }
    : null;

  return {
    id: Number(
      order?.id || 0,
    ),

    status:
      String(
        order?.status ||
          'pending',
      ),

    total:
      String(
        order?.total || '0',
      ),

    currency:
      String(
        order?.currency || '',
      ),

    dateCreated:
      String(
        order?.date_created || '',
      ),

    transactionId:
      String(
        order?.transaction_id ||
          '',
      ),

    customerId:
      Number(
        order?.customer_id || 0,
      ),

    customerPhone,

    customerName:
      `${firstName} ${lastName}`.trim() ||
      'کاربر',

    items:
      Array.isArray(
        order?.line_items,
      )
        ? order.line_items.map(
            (item: any) => ({
              id: Number(
                item?.product_id ||
                  0,
              ),
              name:
                String(
                  item?.name || '',
                ),
              quantity:
                Number(
                  item?.quantity || 0,
                ),
              total:
                String(
                  item?.total || '0',
                ),
            }),
          )
        : [],

    questionnaire:
      parseQuestionnaire(
        metaData,
      ),

    deliveryStatus,

    pdf:
      pdfUrl
        ? {
            url: pdfUrl,
            name:
              pdfName ||
              'فایل رژیم.pdf',
          }
        : null,
  };
}

async function wooFetch(
  endpoint: string,
  options?: RequestInit,
) {
  await requireAdmin();

  const response =
    await fetch(
      `${WOO_API}${endpoint}`,
      {
        ...options,

        headers: {
          Authorization:
            getAuthHeader(),

          Accept:
            'application/json',

          'Content-Type':
            'application/json',

          ...(options?.headers || {}),
        },

        cache: 'no-store',
      },
    );

  if (!response.ok) {
    const text =
      await response.text();

    console.error(
      'Admin WooCommerce error:',
      {
        status:
          response.status,
        body: text,
      },
    );

    throw new Error(
      `WooCommerce request failed: ${response.status}`,
    );
  }

  return response;
}

export async function getAdminOrders(
  options?: {
    search?: string;
    deliveryStatus?: string;
  },
) {
  const params =
    new URLSearchParams({
      per_page: '100',
      page: '1',
      orderby: 'date',
      order: 'desc',
    });

  const response =
    await wooFetch(
      `/orders?${params.toString()}`,
    );

  const data =
    await response.json();

  let orders: AdminOrder[] =
    Array.isArray(data)
      ? data.map(mapOrder)
      : [];

  const search =
    options?.search
      ?.trim()
      .toLowerCase();

  if (search) {
    orders =
      orders.filter(
        (order) => {
          return (
            String(
              order.id,
            ).includes(search) ||
            order.customerPhone.includes(
              search,
            ) ||
            order.customerName
              .toLowerCase()
              .includes(search) ||
            order.items.some(
              (item) =>
                item.name
                  .toLowerCase()
                  .includes(search),
            )
          );
        },
      );
  }

  if (
    options?.deliveryStatus &&
    options.deliveryStatus !==
      'all'
  ) {
    orders =
      orders.filter(
        (order) =>
          order.deliveryStatus ===
          options.deliveryStatus,
      );
  }

  return orders;
}

export async function getAdminOrder(
  orderId: number,
) {
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    throw new Error(
      'Invalid order ID.',
    );
  }

  const response =
    await wooFetch(
      `/orders/${orderId}`,
    );

  const order =
    await response.json();

  return mapOrder(order);
}

export async function updateDeliveryStatus(
  orderId: number,
  status: DeliveryStatus,
) {
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    throw new Error(
      'Invalid order ID.',
    );
  }

  const allowed: DeliveryStatus[] = [
    'pending',
    'preparing',
    'ready',
    'delivered',
  ];

  if (!allowed.includes(status)) {
    throw new Error(
      'Invalid delivery status.',
    );
  }

  const response =
    await wooFetch(
      `/orders/${orderId}`,
      {
        method: 'PUT',

        body:
          JSON.stringify({
            meta_data: [
              {
                key:
                  '_regitamin_delivery_status',
                value:
                  status,
              },
              {
                key:
                  '_regitamin_delivery_updated_at',
                value:
                  String(
                    Date.now(),
                  ),
              },
            ],
          }),
      },
    );

  const order =
    await response.json();

  return mapOrder(order);
}