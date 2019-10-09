import { defaultIrregularPlurals, defaultIrregularSingles, defaultPluralRules, defaultSingularRules, defaultUncountables } from './values';


export default class Pluralize {
  public static pluralRules: any[] = defaultPluralRules;
  public static singularRules: any[] = defaultSingularRules;
  public static uncountables: any = defaultUncountables;
  public static irregularPlurals: any = defaultIrregularPlurals;
  public static irregularSingles: any = defaultIrregularSingles;

  /**
   * Pluralize a word
   * @param word word to pluralize
   * @return string of word pluralized
   */
  public static plural(word: string): string {
    const validate = this.prototype.replaceWord(Pluralize.irregularSingles, Pluralize.irregularPlurals, Pluralize.pluralRules);
    return validate(word);
  }

  /**
   * Check if a word is plural.
   * @param word word to check
   * @return boolean value if word is plural or not
   */
  public static isPlural(word: string): boolean {
    const validate = this.prototype.checkWord(Pluralize.irregularSingles, Pluralize.irregularPlurals, Pluralize.pluralRules);
    return validate(word);
  }

  /**
   * Singularize a word
   * @param word word to singularize
   * @return string of word singularized
   */
  public static singular(word: string): string {
    const validate = this.prototype.replaceWord(Pluralize.irregularPlurals, Pluralize.irregularSingles, Pluralize.singularRules);
    return validate(word);
  }

  /**
   * Check if a word is singular.
   * @param word word to check
   * @return boolean value if word is singular or not
   */
  public static isSingular(word: string): boolean {
    const validate = this.prototype.checkWord(Pluralize.irregularPlurals, Pluralize.irregularSingles, Pluralize.singularRules);
    return validate(word);
  }

  /**
   * Add a pluralization rule to the collection.
   *
   * @param rule rule to add
   * @param replacement replacement
   * 
   */
  public static addPluralRule(rule: string | RegExp, replacement: string): void {
    Pluralize.pluralRules.push([this.prototype.sanitizeRule(rule), replacement]);
  };
  

  /**
   * Add a singularization rule to the collection.
   *
   * @param rule rule to add
   * @param replacement replacement
   * 
   */
  public static addSingularRule(rule: string | RegExp, replacement: string): void {
    Pluralize.singularRules.push([this.prototype.sanitizeRule(rule), replacement]);
  };

  /**
   * Add an uncountable word rule.
   *
   * @param word uncountable word
   * 
   */
  public static addUncountableRule(word: string | RegExp): void {
    if (typeof word === 'string') {
      Pluralize.uncountables[word.toLowerCase()] = true;
      return;
    }

    // Set singular and plural references for the word.
    Pluralize.addPluralRule(word, '$0');
    Pluralize.addSingularRule(word, '$0');
  };


  /**
   * Add an irregular word rule.
   *
   * @param single single name
   * @param plural plural name
   * 
   */
  public static addIrregularRule(single:  string, plural: string): void {
    plural = plural.toLowerCase();
    single = single.toLowerCase();

    Pluralize.irregularSingles[single] = plural;
    Pluralize.irregularPlurals[plural] = single;
  };


  /**
   * Sanitize a pluralization rule to a usable regular expression.
   *
   * @param rule rule to transform
   * @return sanitized rule
   */
  public sanitizeRule (rule: string | RegExp) {
    if (typeof rule === 'string') {
      return new RegExp('^' + rule + '$', 'i');
    }
    return rule;
  }

  /**
   * Pass in a word token to produce a function that can replicate the case on
   * another word.
   *
   * @param word word to generate
   * @param token token to generate
   * @return Function to implement
   */
  public restoreCase (word: string, token: string) {
    // Tokens are an exact match.
    if (word === token) {
      return token
    }

    // Lower cased words. E.g. "hello".
    if (word === word.toLowerCase()) {
      return token.toLowerCase();
    }

    // Upper cased words. E.g. "WHISKY".
    if (word === word.toUpperCase()) {
      return token.toUpperCase();
    }

    // Title cased words. E.g. "Title".
    if (word[0] === word[0].toUpperCase()) {
      return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    }

    // Lower cased words. E.g. "test".
    return token.toLowerCase();
  }


  /**
   * Interpolate a regexp string.
   *
   * @param str string to generate
   * @param args args to generate
   * @return a string
   */
  public interpolate(str: string, args: IArguments) {
    return str.replace(/\$(\d{1,2})/g, (match, index) => {
      return args[index] || '';
    });
  }

  /**
   * Replace a word using a rule.
   *
   * @param word word to format
   * @param rule word to use in format
   * @return string
   */
  public replace(word: string, rule: any[]) {
    return word.replace(rule[0], (match, index) => {
      const result = this.interpolate(rule[1], arguments);
      if (match === '') {
        return this.restoreCase(word[index - 1], result);
      }

      return this.restoreCase(match, result);
    });
  }

  /**
   * Sanitize a word by passing in the word and sanitization rules.
   *
   * @param token
   * @param word
   * @param rules
   * @return string
   */
  public sanitizeWord(token: string, word: string, rules: any[]) {
    // Empty string or doesn't need fixing.
    if (!token.length || Pluralize.uncountables.hasOwnProperty(token)) {
      return word;
    }

    let len = rules.length;

    // Iterate over the sanitization rules and use the first one to match.
    while (len--) {
      const rule = rules[len];

      if (rule[0].test(word)) {
        return this.replace(word, rule)
      }
    }

    return word;
  }
  /**
   * Replace a word with the updated word.
   *
   * @param replaceMap object
   * @param keepMap object
   * @param rules array
   * @return Function
   */
  public replaceWord(replaceMap: any, keepMap: any, rules: any) {
    return (word: string) => {
      // Get the correct token and case restoration functions.
      const token: string = word.toLowerCase();

      // Check against the keep object map.
      if (keepMap.hasOwnProperty(token)) {
        return this.restoreCase(word, token);
      }

      // Check against the replacement map for a direct word replacement.
      if (replaceMap.hasOwnProperty(token)) {
        return this.restoreCase(word, replaceMap[token]);
      }

      // Run all the rules against the word.
      return this.sanitizeWord(token, word, rules);
    };
  }

  /**
   * Check if a word is part of the map.
   * @param replaceMap object
   * @param keepMap object
   * @param rules array
   * @param bool boolean value
   * @return Function
   */
  public checkWord(replaceMap: any, keepMap: any, rules: any, bool?: boolean) {
    return (word: string) => {
      const token = word.toLowerCase();

      if (keepMap.hasOwnProperty(token)) {
        return true;
      }
      if (replaceMap.hasOwnProperty(token)) {
        return false;
      }
      return this.sanitizeWord(token, token, rules) === token;
    };
  }

}

