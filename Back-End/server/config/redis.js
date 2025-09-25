const Redis = require('ioredis');

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Use Redis Cloud or local Redis based on environment
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        keepAlive: 30000,
        family: 4,
        db: 0
      });

      this.client.on('connect', () => {
        console.log('🔌 Redis: Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis: Ready');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Error:', err);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('⚠️ Redis: Connection closed');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis: Reconnecting...');
      });

      await this.client.connect();
      
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      this.isConnected = false;
      // Don't throw error - app can work without Redis
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) { // Default 5 minutes TTL
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // Generate cache keys for different data types
  generateKey(type, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `aaa:${type}:${sortedParams}`;
  }

  // Cache business search results
  async cacheBusinessSearch(searchParams, results) {
    const key = this.generateKey('business_search', searchParams);
    return await this.set(key, results, 600); // 10 minutes TTL
  }

  // Get cached business search results
  async getCachedBusinessSearch(searchParams) {
    const key = this.generateKey('business_search', searchParams);
    return await this.get(key);
  }

  // Cache business by ID
  async cacheBusiness(id, business) {
    const key = this.generateKey('business', { id });
    return await this.set(key, business, 1800); // 30 minutes TTL
  }

  // Get cached business by ID
  async getCachedBusiness(id) {
    const key = this.generateKey('business', { id });
    return await this.get(key);
  }

  // Invalidate business cache when updated
  async invalidateBusinessCache(id) {
    const key = this.generateKey('business', { id });
    await this.del(key);
    
    // Also invalidate search caches
    const searchKeys = await this.client.keys('aaa:business_search:*');
    if (searchKeys.length > 0) {
      await this.client.del(...searchKeys);
    }
  }
}

// Create singleton instance
const redisCache = new RedisCache();

module.exports = redisCache;
