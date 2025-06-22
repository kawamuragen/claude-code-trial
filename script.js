class StockAnalyzer {
    constructor() {
        this.apiKey = 'demo';
        this.chart = null;
        this.currentData = null;
        this.useYahooFinance = true; // Yahoo Finance非公式APIを使用
        this.cache = new Map(); // キャッシュ機能
        this.cacheExpiry = 5 * 60 * 1000; // 5分間キャッシュ
        this.init();
    }

    init() {
        this.bindEvents();
        this.initChart();
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const stockSymbol = document.getElementById('stockSymbol');
        const apiRadios = document.querySelectorAll('input[name="apiSource"]');

        searchBtn.addEventListener('click', () => this.searchStock());
        stockSymbol.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                this.searchStock();
            }
        });

        // API選択の変更をリスニング
        apiRadios.forEach(radio => {
            radio.addEventListener('change', e => {
                this.useYahooFinance = e.target.value === 'yahoo';
            });
        });
    }

    initChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '株価',
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: '20日移動平均',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderDash: [5, 5],
                    },
                    {
                        label: '50日移動平均',
                        data: [],
                        borderColor: '#f39c12',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderDash: [10, 5],
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '株価チャート',
                    },
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '価格 ($)',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日付',
                        },
                    },
                },
            },
        });
    }

    async searchStock() {
        const symbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
        if (!symbol) {
            this.showError('株式コードを入力してください');
            return;
        }

        this.setLoading(true);
        try {
            await this.fetchStockData(symbol);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async fetchStockData(symbol) {
        // キャッシュをチェック
        const cacheKey = `${symbol}_${this.useYahooFinance ? 'yahoo' : 'alpha'}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            this.currentData = cached.dailyData;
            this.updateUI(symbol, cached.globalQuote, cached.dailyData);
            this.updateChart(cached.dailyData);
            this.calculateTechnicalIndicators(cached.dailyData);
            this.showMessage(`${symbol}のキャッシュデータを表示しています`, 'info');
            return;
        }

        if (this.useYahooFinance) {
            try {
                await this.fetchYahooFinanceData(symbol);
            } catch (error) {
                console.warn('Yahoo Finance API failed, using demo data:', error);
                this.useDemoData(symbol);
            }
            return;
        }

        if (this.apiKey === 'demo' || !this.apiKey) {
            this.useDemoData(symbol);
            return;
        }

        try {
            const dailyData = await this.fetchDailyData(symbol);
            const globalQuote = await this.fetchGlobalQuote(symbol);

            this.currentData = dailyData;
            this.updateUI(symbol, globalQuote, dailyData);
            this.updateChart(dailyData);
            this.calculateTechnicalIndicators(dailyData);
        } catch (error) {
            if (
                error.message.includes('API call frequency') ||
                error.message.includes('株式コードが見つかりません')
            ) {
                this.useDemoData(symbol);
            } else {
                throw error;
            }
        }
    }

    async fetchDailyData(symbol) {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data['Error Message']) {
            throw new Error('株式コードが見つかりません');
        }

        if (data['Note']) {
            throw new Error('API call frequency exceeded');
        }

        return data['Time Series (Daily)'] || {};
    }

    async fetchGlobalQuote(symbol) {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data['Error Message']) {
            throw new Error('株式コードが見つかりません');
        }

        return data['Global Quote'] || {};
    }

    async fetchYahooFinanceData(symbol) {
        try {
            // CORSエラーを回避するためにプロキシサービスを使用
            const quoteUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
            const response = await fetch(quoteUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const proxyData = await response.json();

            if (!proxyData.contents) {
                throw new Error('プロキシサーバーからデータを取得できませんでした');
            }

            const data = JSON.parse(proxyData.contents);

            if (!data.chart?.result?.[0]) {
                throw new Error('株式コードが見つかりません');
            }

            const result = data.chart.result[0];
            const meta = result.meta;
            const quotes = result.indicators.quote[0];
            const timestamps = result.timestamp;

            // データを整形
            const dailyData = {};
            for (let i = 0; i < timestamps.length; i++) {
                if (quotes.close[i] !== null && quotes.close[i] !== undefined) {
                    const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
                    dailyData[date] = {
                        '1. open': (quotes.open[i] || quotes.close[i]).toFixed(2),
                        '2. high': (quotes.high[i] || quotes.close[i]).toFixed(2),
                        '3. low': (quotes.low[i] || quotes.close[i]).toFixed(2),
                        '4. close': quotes.close[i].toFixed(2),
                        '5. volume': quotes.volume[i] || 0,
                    };
                }
            }

            console.log('Yahoo Finance データ構造:', {
                timestamps: timestamps.length,
                dailyDataCount: Object.keys(dailyData).length,
                sampleData: Object.values(dailyData)[0],
            });

            // 現在の価格情報を作成
            const currentPrice = meta.regularMarketPrice;
            const previousClose = meta.previousClose;
            const change = currentPrice - previousClose;
            const changePercent = ((change / previousClose) * 100).toFixed(2);

            const globalQuote = {
                '01. symbol': symbol,
                '05. price': currentPrice.toFixed(2),
                '09. change': change.toFixed(2),
                '10. change percent': `${changePercent}%`,
            };

            this.currentData = dailyData;
            this.updateUI(symbol, globalQuote, dailyData);
            this.updateChart(dailyData);
            this.calculateTechnicalIndicators(dailyData);

            // キャッシュに保存
            const cacheKey = `${symbol}_yahoo`;
            this.cache.set(cacheKey, {
                dailyData,
                globalQuote,
                timestamp: Date.now(),
            });

            this.showMessage(
                `${symbol}のリアルタイムデータを取得しました（Yahoo Finance）`,
                'info'
            );
        } catch (error) {
            throw new Error(`Yahoo Finance API error: ${error.message}`);
        }
    }

    useDemoData(symbol) {
        const today = new Date();
        const demoData = {};

        for (let i = 100; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const basePrice = 150 + Math.sin(i / 10) * 20;
            const randomVariation = (Math.random() - 0.5) * 10;
            const price = (basePrice + randomVariation).toFixed(2);

            demoData[dateStr] = {
                '1. open': price,
                '2. high': (parseFloat(price) + Math.random() * 5).toFixed(2),
                '3. low': (parseFloat(price) - Math.random() * 5).toFixed(2),
                '4. close': price,
                '5. volume': Math.floor(Math.random() * 1000000 + 500000),
            };
        }

        const latestPrice = parseFloat(
            Object.values(demoData)[Object.keys(demoData).length - 1]['4. close']
        );
        const prevPrice = parseFloat(
            Object.values(demoData)[Object.keys(demoData).length - 2]['4. close']
        );
        const change = latestPrice - prevPrice;
        const changePercent = ((change / prevPrice) * 100).toFixed(2);

        const demoQuote = {
            '01. symbol': symbol,
            '05. price': latestPrice.toFixed(2),
            '09. change': change.toFixed(2),
            '10. change percent': `${changePercent}%`,
        };

        this.currentData = demoData;
        this.updateUI(symbol, demoQuote, demoData);
        this.updateChart(demoData);
        this.calculateTechnicalIndicators(demoData);

        this.showMessage(
            `${symbol}のデモデータを表示しています。実際のデータを取得するにはAlpha Vantage APIキーが必要です。`,
            'info'
        );
    }

    updateUI(symbol, quote, dailyData) {
        document.getElementById('stockName').textContent = `${symbol} - 株価情報`;

        const currentPrice = quote['05. price'] || '--';
        const change = quote['09. change'] || '0';
        const changePercent = quote['10. change percent'] || '0%';

        document.getElementById('currentPrice').textContent = `$${currentPrice}`;

        const priceChangeElement = document.getElementById('priceChange');
        const changeValue = parseFloat(change);
        priceChangeElement.textContent = `${changeValue >= 0 ? '+' : ''}${change} (${changePercent})`;
        priceChangeElement.className = `price-change ${changeValue >= 0 ? 'positive' : 'negative'}`;

        const prices = Object.values(dailyData).map(day => parseFloat(day['4. close']));
        const volumes = Object.values(dailyData).map(day => parseInt(day['5. volume']));
        const highs = Object.values(dailyData).map(day => parseFloat(day['2. high']));
        const lows = Object.values(dailyData).map(day => parseFloat(day['3. low']));

        document.getElementById('highPrice').textContent = `$${Math.max(...highs).toFixed(2)}`;
        document.getElementById('lowPrice').textContent = `$${Math.min(...lows).toFixed(2)}`;
        document.getElementById('volume').textContent =
            volumes[volumes.length - 1]?.toLocaleString() || '--';
    }

    updateChart(dailyData) {
        const sortedDates = Object.keys(dailyData).sort();
        const dates = sortedDates.slice(-60);
        const prices = dates.map(date => parseFloat(dailyData[date]['4. close']));

        console.log('チャートデータ:', {
            dates: dates.length,
            prices: prices.length,
            samplePrices: prices.slice(0, 5),
        });

        this.chart.data.labels = dates.map(date => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        this.chart.data.datasets[0].data = prices;

        const ma20 = this.calculateMovingAverage(prices, 20);
        const ma50 = this.calculateMovingAverage(prices, 50);

        this.chart.data.datasets[1].data = ma20;
        this.chart.data.datasets[2].data = ma50;

        this.chart.update();
    }

    calculateMovingAverage(prices, period) {
        const ma = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                ma.push(null);
            } else {
                const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                ma.push(sum / period);
            }
        }
        return ma;
    }

    calculateTechnicalIndicators(dailyData) {
        const prices = Object.values(dailyData).map(day => parseFloat(day['4. close']));

        const ma20 = this.calculateMovingAverage(prices, 20);
        const ma50 = this.calculateMovingAverage(prices, 50);
        const rsi = this.calculateRSI(prices, 14);

        const latestMA20 = ma20[ma20.length - 1];
        const latestMA50 = ma50[ma50.length - 1];
        const latestRSI = rsi[rsi.length - 1];

        document.getElementById('ma20').textContent = latestMA20
            ? `$${latestMA20.toFixed(2)}`
            : '--';
        document.getElementById('ma50').textContent = latestMA50
            ? `$${latestMA50.toFixed(2)}`
            : '--';
        document.getElementById('rsi').textContent = latestRSI ? latestRSI.toFixed(2) : '--';
    }

    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return [null];

        const gains = [];
        const losses = [];

        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        const rsi = [];
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

        for (let i = 0; i < period; i++) {
            rsi.push(null);
        }

        let rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));

        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
            rs = avgGain / avgLoss;
            rsi.push(100 - 100 / (1 + rs));
        }

        return rsi;
    }

    setLoading(loading) {
        const searchBtn = document.getElementById('searchBtn');
        if (loading) {
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<div class="loading"></div>';
        } else {
            searchBtn.disabled = false;
            searchBtn.textContent = '株価を取得';
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector(
            '.error-message, .success-message, .info-message'
        );
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className =
            type === 'error'
                ? 'error-message'
                : type === 'info'
                  ? 'info-message'
                  : 'success-message';
        messageDiv.textContent = message;

        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentElement('afterend', messageDiv);
        } else {
            document.body.appendChild(messageDiv);
        }

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StockAnalyzer();
});
