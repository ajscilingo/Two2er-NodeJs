const Enumify = require('Enumify');

class Degree extends Enumify.Enum { }
Degree.initEnum(['AA', 'AS', 'BA', 'BS', 'MA', 'MS', 'MBA', 'PHD']);

module.exports = Degree;