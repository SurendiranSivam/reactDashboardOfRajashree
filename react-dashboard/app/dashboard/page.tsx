'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ShoppingCart,
    Users,
    Package,
    DollarSign,
    TrendingUp,
    RefreshCw,
    Calendar,
    Filter,
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '@/lib/services/dashboard.service';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface DashboardStats {
    totalSales: number;
    orderCount: number;
    customerCount: number;
    productCount: number;
}

interface WeeklyData {
    day: string;
    total_sales: number;
    order_count: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalSales: 0,
        orderCount: 0,
        customerCount: 0,
        productCount: 0,
    });

    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSource, setSelectedSource] = useState<string>('All');

    // Fetch real-time data - Matching Flutter logic exactly
    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            try {
                console.log('📅 Fetching data for date:', selectedDate.toISOString().split('T')[0]);
                console.log('🎯 Source filter:', selectedSource);

                // Parallel fetch all data - exact same as Flutter
                const [dailyStats, customers, products, weekly] = await Promise.all([
                    dashboardService.getDailySalesStats(selectedDate, selectedSource === 'All' ? 'All' : selectedSource),
                    dashboardService.getTotalCustomers(),
                    dashboardService.getTotalProducts(),
                    dashboardService.getWeeklySalesStats(selectedDate), // Pass selected date
                ]);

                console.log('📊 Daily stats received:', dailyStats);
                console.log('📈 Weekly data received:', weekly);

                // Process daily stats - dailyStats is already a single object or null
                setStats({
                    totalSales: dailyStats?.total_sales || 0,
                    orderCount: dailyStats?.order_count || 0,
                    customerCount: customers,
                    productCount: products,
                });

                // Process weekly data for chart
                const formattedWeekly = weekly?.map((item, index) => ({
                    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || `Day ${index + 1}`,
                    total_sales: item.total_sales || 0,
                    order_count: item.order_count || 0,
                })) || [];

                setWeeklyData(formattedWeekly);

                if (dailyStats?.total_sales === 0 && dailyStats?.order_count === 0) {
                    console.warn('⚠️ No sales data found for selected date:', selectedDate.toDateString());
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [selectedDate, selectedSource]); // Refresh when date or source changes

    const handleRefresh = () => {
        setLoading(true);
        // Trigger re-fetch by updating state
        setSelectedDate(new Date(selectedDate));
    };

    const statCards = [
        {
            title: `Sales (${selectedDate.toDateString() === new Date().toDateString() ? 'Today' : 'Selected'})`,
            value: `₹${stats.totalSales.toLocaleString('en-IN')}`,
            icon: DollarSign,
            change: '+12.5%',
            gradient: 'from-purple-500 to-indigo-600',
            bgGradient: 'from-purple-50 to-indigo-50',
        },
        {
            title: `Orders (${selectedDate.toDateString() === new Date().toDateString() ? 'Today' : 'Selected'})`,
            value: stats.orderCount.toString(),
            icon: ShoppingCart,
            change: '+8.2%',
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-50',
        },
        {
            title: 'Customers',
            value: stats.customerCount.toString(),
            icon: Users,
            change: '+5.1%',
            gradient: 'from-orange-500 to-red-600',
            bgGradient: 'from-orange-50 to-red-50',
        },
        {
            title: 'Products',
            value: stats.productCount.toString(),
            icon: Package,
            change: '+2.3%',
            gradient: 'from-blue-500 to-cyan-600',
            bgGradient: 'from-blue-50 to-cyan-50',
        },
    ];

    return (
        <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header - Matching Flutter */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Welcome back! Here's your business summary.
                        </p>
                    </div>

                    {/* Filters - Date & Source */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Date Picker */}
                        <DatePicker
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                        />

                        {/* Source Filter */}
                        <select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium"
                        >
                            <option value="All">All Sources</option>
                            <option value="Website">Website</option>
                            <option value="WhatsApp">WhatsApp</option>
                        </select>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* No Data Info Banner */}
            {!loading && stats.totalSales === 0 && stats.orderCount === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">
                            No sales data for {selectedDate.toDateString() === new Date().toDateString() ? 'today' : selectedDate.toDateString()}
                        </h3>
                        <p className="text-sm text-blue-700">
                            No orders found for <strong>{selectedDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                            Try selecting a different date using the date picker above to view historical data.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards - REAL-TIME DATA */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <Card
                            key={stat.title}
                            className={`hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br ${stat.bgGradient} overflow-hidden relative`}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-16 -mt-16`} />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium text-gray-700">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    {stat.change} from last month
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Compact KPI Mini-Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sales Trend Mini */}
                <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Weekly Trend</p>
                                <h3 className="text-lg font-bold text-gray-900">Sales</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={60}>
                            <LineChart data={weeklyData}>
                                <Line
                                    type="monotone"
                                    dataKey="total_sales"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                    </CardContent>
                </Card>

                {/* Orders Trend Mini */}
                <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Weekly Trend</p>
                                <h3 className="text-lg font-bold text-gray-900">Orders</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={60}>
                            <LineChart data={weeklyData}>
                                <Line
                                    type="monotone"
                                    dataKey="order_count"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                    </CardContent>
                </Card>

                {/* Average Order Value */}
                <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Average Order</p>
                                <h3 className="text-lg font-bold text-gray-900">
                                    ₹{stats.orderCount > 0 ? Math.round(stats.totalSales / stats.orderCount) : 0}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="h-[60px] flex items-center">
                            <div className="w-full bg-gradient-to-r from-orange-200 to-red-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min((stats.orderCount / stats.customerCount) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Per customer order</p>
                    </CardContent>
                </Card>

                {/* Conversion Rate */}
                <Card className="border-0 shadow-md overflow-hidden hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Active Rate</p>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {stats.customerCount > 0 ? ((stats.orderCount / stats.customerCount) * 100).toFixed(1) : 0}%
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="h-[60px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={60}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Active', value: stats.orderCount },
                                            { name: 'Inactive', value: Math.max(0, stats.customerCount - stats.orderCount) }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={15}
                                        outerRadius={25}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        <Cell fill="#3B82F6" />
                                        <Cell fill="#E5E7EB" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Customer engagement</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Sales Performance - Area Chart */}
                <Card className="border-0 shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Weekly Sales Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="h-[320px] flex items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                            </div>
                        ) : weeklyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={weeklyData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#6B7280"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: '1px solid #E5E7EB',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            padding: '12px'
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total_sales"
                                        name="Sales (₹)"
                                        stroke="#6366F1"
                                        strokeWidth={3}
                                        fill="url(#colorSales)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="order_count"
                                        name="Orders"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fill="url(#colorOrders)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[320px] flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>No weekly data available</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Distribution - Bar Chart */}
                <Card className="border-0 shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                            Daily Order Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="h-[320px] flex items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
                            </div>
                        ) : weeklyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#6B7280"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            border: '1px solid #E5E7EB',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            padding: '12px'
                                        }}
                                        cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Bar
                                        dataKey="order_count"
                                        name="Orders"
                                        fill="#10B981"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[320px] flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>No order data available</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
