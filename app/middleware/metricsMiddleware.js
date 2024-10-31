const StatsD = require('node-statsd');
const client = new StatsD();
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

const logApiMetrics = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    client.increment(`api.${req.path}.count`);
    client.timing(`api.${req.path}.time`, duration);

    cloudwatch.putMetricData({
      MetricData: [
        { MetricName: 'APICallCount', Dimensions: [{ Name: 'API', Value: req.path }], Unit: 'Count', Value: 1 },
        { MetricName: 'APICallDuration', Dimensions: [{ Name: 'API', Value: req.path }], Unit: 'Milliseconds', Value: duration }
      ],
      Namespace: 'WebAppMetrics'
    }).promise().catch(err => console.error("Error sending CloudWatch metrics:", err));
  });

  next();
};

module.exports = { logApiMetrics };