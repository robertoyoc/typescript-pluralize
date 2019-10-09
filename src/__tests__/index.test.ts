import Pluralize from '../index';

test('Pluralize', () => {
  const value = Pluralize.plural('apple');
  expect(value).toBe('apples');

});
test('Pluralize 2', () => {
  Pluralize.addPluralRule(/gex$/i, 'gexii')
  const value = Pluralize.plural('regex');
  expect(value).toBe('regexii');
});
test('Pluralize 3', () => {
  const value = Pluralize.singular('singles')
  expect(value).toBe('single');
});
test('Pluralize 4', () => {

  Pluralize.addSingularRule(/singles$/i, 'singular')
  const value = Pluralize.singular('singles')
  expect(value).toBe('singular');
});
test('Pluralize 5', () => {

  const value = Pluralize.plural('irregular');

  expect(value).toBe('irregulars');
});
test('Pluralize 6', () => {

  Pluralize.addIrregularRule('irregular', 'regular')
  const value = Pluralize.plural('irregular');
  expect(value).toBe('regular');
});
test('Pluralize 7', () => {

  const value = Pluralize.plural('paper');
  expect(value).toBe('papers');
});
test('Pluralize 8', () => {
  
  Pluralize.addUncountableRule('paper')
  const value = Pluralize.plural('paper');
  expect(value).toBe('paper');
});
test('Pluralize 9', () => {
  
  Pluralize.addUncountableRule('paper')
  const value = Pluralize.isPlural('test');
  expect(value).toBe(false);
});
test('Pluralize 10', () => {
  
  const value = Pluralize.isSingular('test');
  expect(value).toBe(true);
});
