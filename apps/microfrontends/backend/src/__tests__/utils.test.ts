import { validateUrl, isValidParam } from '../utils.js';

describe('Utils', () => {
    describe('validateUrl', () => {
        it('should return valid HTTP URLs', () => {
            expect(validateUrl('http://example.com')).toBe('http://example.com/');
            expect(validateUrl('https://example.com')).toBe('https://example.com/');
        });

        it('should throw an error for non HTTP/HTTPS URLs', () => {
            expect(() => validateUrl('ftp://example.com')).toThrow('Invalid URL protocol. Only HTTP and HTTPS are allowed.');
        });
    });

    describe('isValidParam', () => {
        it('should return true for valid params', () => {
            expect(isValidParam('valid_Param-123')).toBe(true);
        });

        it('should return false for invalid params', () => {
            expect(isValidParam('invalid/param')).toBe(false);
            expect(isValidParam('invalid..param')).toBe(false);
        });
    });
});
