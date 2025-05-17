const isProduction = process.env.NODE_ENV === 'production';

export const appConfig = {
    appName: 'Daily Wellness AI',
    cacheType: isProduction ? 's3' : 's3',
    dbName: 'daily_wellness_db'
};
