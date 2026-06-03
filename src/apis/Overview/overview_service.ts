import auth_model from "../Auth/auth_model";
import { business_model } from "../Business/business_model";
import { category_model } from "../Category/category_model";
import { coupon_model } from "../Coupon/coupon_model";
import { order_model } from "../Order/order_model";
import { payment_model } from "../Payment/payment_model";
import { product_model } from "../Product/product_model";
import { review_model } from "../Review/review_model";
import { service_model } from "../Service/service_model";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const deliveryStatuses = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "canceled",
  "returned",
];

const revenueOrderFilter: Record<string, unknown> = {
  delivery_status: { $nin: ["canceled", "returned"] },
};

const normalizeYear = (year?: string) => {
  const parsedYear = Number(year);

  if (
    Number.isInteger(parsedYear) &&
    parsedYear >= 1970 &&
    parsedYear <= 3000
  ) {
    return parsedYear;
  }

  return new Date().getFullYear();
};

const getYearRange = (year: number) => ({
  start: new Date(Date.UTC(year, 0, 1)),
  end: new Date(Date.UTC(year + 1, 0, 1)),
});

const getSafeNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getRevenueForRange = (start: Date, end: Date) =>
  order_model.aggregate<{ totalRevenue: number; totalOrders: number }>([
    {
      $match: {
        ...revenueOrderFilter,
        createdAt: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$final_amount" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

async function get_overview(year_user?: string, year_payment?: string) {
  const current_year_user = normalizeYear(year_user);
  const current_year_payment = normalizeYear(year_payment);
  const userYearRange = getYearRange(current_year_user);
  const paymentYearRange = getYearRange(current_year_payment);
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const weekStart = addDays(todayStart, -6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalVendors,
    totalProfessionals,
    totalAdmins,
    totalOrders,
    totalPendingOrders,
    totalDeliveredOrders,
    totalCanceledOrders,
    totalProducts,
    lowStockProducts,
    totalCategories,
    activeCategories,
    totalServices,
    activeServices,
    totalReviews,
    totalBusinesses,
    approvedBusinesses,
    pendingBusinesses,
    totalCoupons,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    ordersToday,
    newCustomersToday,
    lowStockProductList,
    orderRevenue,
    monthlyRevenue,
    monthlyUsers,
    users_year,
    payment_year,
    paymentEarning,
    orderStatusStats,
    roleStats,
    avgRating,
    recentOrders,
  ] = await Promise.all([
    auth_model.countDocuments({ role: "USER" }),
    auth_model.countDocuments({ role: "VENDOR" }),
    auth_model.countDocuments({ role: "PROFESSIONAL" }),
    auth_model.countDocuments({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } }),
    order_model.countDocuments(),
    order_model.countDocuments({ delivery_status: "pending" }),
    order_model.countDocuments({ delivery_status: "delivered" }),
    order_model.countDocuments({ delivery_status: "canceled" }),
    product_model.countDocuments({ is_deleted: false }),
    product_model.countDocuments({ is_deleted: false, stock: { $lte: 10 } }),
    category_model.countDocuments(),
    category_model.countDocuments({ is_active: true }),
    service_model.countDocuments(),
    service_model.countDocuments({ is_active: true }),
    review_model.countDocuments(),
    business_model.countDocuments(),
    business_model.countDocuments({ is_approve: true }),
    business_model.countDocuments({ is_approve: false }),
    coupon_model.countDocuments(),
    getRevenueForRange(todayStart, tomorrowStart),
    getRevenueForRange(weekStart, tomorrowStart),
    getRevenueForRange(monthStart, tomorrowStart),
    order_model.countDocuments({
      createdAt: { $gte: todayStart, $lt: tomorrowStart },
    }),
    auth_model.countDocuments({
      role: "USER",
      createdAt: { $gte: todayStart, $lt: tomorrowStart },
    }),
    product_model
      .find({ is_deleted: false, stock: { $lte: 10 } })
      .sort({ stock: 1 })
      .limit(5)
      .select("_id name stock img price flag")
      .lean(),
    order_model.aggregate([
      { $match: revenueOrderFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$final_amount" },
          averageOrderValue: { $avg: "$final_amount" },
        },
      },
    ]),
    order_model.aggregate([
      {
        $match: {
          ...revenueOrderFilter,
          createdAt: {
            $gte: paymentYearRange.start,
            $lt: paymentYearRange.end,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$final_amount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    auth_model.aggregate([
      {
        $match: {
          role: { $nin: ["ADMIN", "SUPER_ADMIN"] },
          createdAt: {
            $gte: userYearRange.start,
            $lt: userYearRange.end,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    auth_model.aggregate([
      {
        $match: {
          role: { $nin: ["ADMIN", "SUPER_ADMIN"] },
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          years: { $push: "$_id" },
        },
      },
    ]),
    order_model.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          years: { $push: "$_id" },
        },
      },
    ]),
    payment_model.aggregate([
      { $match: { status: true } },
      {
        $group: {
          _id: null,
          total_amount: { $sum: "$amount" },
          total_payments: { $sum: 1 },
        },
      },
    ]),
    order_model.aggregate([
      {
        $group: {
          _id: "$delivery_status",
          count: { $sum: 1 },
        },
      },
    ]),
    auth_model.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
    review_model.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
        },
      },
    ]),
    order_model
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "_id final_amount total_amount delivery_status payment_status createdAt order_date user",
      )
      .populate({
        path: "user",
        select: "name email",
      })
      .lean(),
  ]);

  const revenueByMonth = new Map(
    monthlyRevenue.map((item: any) => [
      item._id,
      {
        revenue: getSafeNumber(item.revenue),
        orders: getSafeNumber(item.orders),
      },
    ]),
  );
  const usersByMonth = new Map(
    monthlyUsers.map((item: any) => [item._id, getSafeNumber(item.users)]),
  );

  const monthlyOverview = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const revenue = revenueByMonth.get(month);

    return {
      month,
      label: shortMonthNames[index],
      revenue: revenue?.revenue ?? 0,
      amount: revenue?.revenue ?? 0,
      orders: revenue?.orders ?? 0,
      users: usersByMonth.get(month) ?? 0,
    };
  });

  const ordersByStatus = deliveryStatuses.reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {} as Record<string, number>,
  );
  orderStatusStats.forEach((item: any) => {
    if (item?._id) ordersByStatus[item._id] = item.count ?? 0;
  });

  const roleCounts = roleStats.reduce((acc: Record<string, number>, item: any) => {
    if (item?._id) acc[item._id] = item.count ?? 0;
    return acc;
  }, {});

  const totalRevenue = getSafeNumber(orderRevenue?.[0]?.totalRevenue);
  const averageOrderValue = getSafeNumber(orderRevenue?.[0]?.averageOrderValue);
  const totalPaymentEarning = getSafeNumber(paymentEarning?.[0]?.total_amount);
  const orderStatusChart = deliveryStatuses.map((status) => ({
    status,
    label: status.replace(/_/g, " "),
    count: ordersByStatus[status] ?? 0,
  }));

  return {
    success: true,
    message: "overview fetched successfully",
    data: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      totalCategories,
      totalReviews,
      totalServices,
      totalVendors,
      totalProfessionals,
      totalAdmins,
      totalBusinesses,
      totalCoupons,
      totalPendingOrders,
      totalDeliveredOrders,
      totalCanceledOrders,
      revenueToday: getSafeNumber(todayRevenue?.[0]?.totalRevenue),
      revenueWeek: getSafeNumber(weekRevenue?.[0]?.totalRevenue),
      revenueMonth: getSafeNumber(monthRevenue?.[0]?.totalRevenue),
      ordersToday,
      ordersThisWeek: getSafeNumber(weekRevenue?.[0]?.totalOrders),
      ordersThisMonth: getSafeNumber(monthRevenue?.[0]?.totalOrders),
      newCustomersToday,
      lowStockProducts,
      lowStockProductList,
      activeCategories,
      activeServices,
      approvedBusinesses,
      pendingBusinesses,
      averageOrderValue,
      totalPaymentEarning,
      totalPayments: paymentEarning?.[0]?.total_payments ?? 0,
      avgRating: avgRating?.[0]?.avg ?? 0,
      ordersByStatus,
      orderStatusChart,
      roleCounts,
      recentOrders,
      revenueChart: monthlyOverview.map(({ label, revenue, amount, orders }) => ({
        label,
        revenue,
        amount,
        orders,
      })),
      monthlyOverview,

      // Legacy keys kept for any existing dashboard widgets still using them.
      user: totalUsers,
      professionals: totalProfessionals,
      total_earning: totalRevenue,
      earningGrowth: {
        data: monthlyOverview.map((item) => item.revenue),
        monthNames,
      },
      userGrowth: {
        data: monthlyOverview.map((item) => item.users),
        monthNames,
      },
      users_year: users_year?.[0]?.years ?? [current_year_user],
      payment_year: payment_year?.[0]?.years ?? [current_year_payment],
    },
  };
}

async function get_public_stats() {
  const [avg_rating, total_users, total_delivered_orders, total_products] =
    await Promise.all([
      review_model.aggregate([
        { $match: { review_for: "WEBSITE" } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
      auth_model.countDocuments({ role: "USER" }),
      order_model.countDocuments({ delivery_status: "delivered" }),
      product_model.countDocuments({ is_deleted: false }),
    ]);

  return {
    success: true,
    data: {
      avg_rating: avg_rating?.[0]?.avg ?? 0,
      total_users,
      total_delivered_orders,
      total_products,
    },
  };
}

export const overview_service = Object.freeze({
  get_overview,
  get_public_stats,
});
