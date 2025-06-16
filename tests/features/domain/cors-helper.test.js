import { isAllowAccess, getMainDomain, updateConfiguredDomains } from "../../../src/features/domain/cors-helper";

describe("isAllowAccess", () => {
    it("should allow access if configuredDomains is falsy", async () => {
        const result = isAllowAccess("origin");
        expect(result).toBe(true);
    });

    it("should allow access if origin is undefined", async () => {
        const result = isAllowAccess();
        expect(result).toBe(true);
    });

    describe("when mainDomain does not has subdomain", () => {
        it("should not allow access if configuredDomains does not include mainDomain", async () => {
            // Arrange
            updateConfiguredDomains("xyz.com;abcd.com;abd.com");

            // Act
            const result = isAllowAccess("abdx.com");

            // Assert
            expect(result).toBe(false);
        });
        it("should allow access if configuredDomains includes mainDomain", async () => {
            // Arrange
            updateConfiguredDomains("xyz.com;abcd.com;abd.com");

            // Act
            const result = isAllowAccess("abd.com");

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("when mainDomain has subdomain", () => {
        it("should allow access if configuredDomains includes mainDomain", async () => {
            // Arrange
            updateConfiguredDomains("xyz.com;abcd.com;abd.com");

            // Act
            //await queryDomains();
            const result = isAllowAccess("xxx.abd.com");

            // Assert
            expect(result).toBe(true);
        });

        it("should not allow access if configuredDomains does not include mainDomain", async () => {
            // Arrange
            updateConfiguredDomains("xyz.com;abcd.com;abd.com");

            // Act
            //await queryDomains();
            const result = isAllowAccess("ab.abdx.com");

            // Assert
            expect(result).toBe(false);
        });
    });
});

describe("getMainDomain", () => {
    const testCase = [
        { name: "has sub domain", url: "subdomain.maindomain.com", expected: "maindomain.com" },
        { name: "has https", url: "https://maindomain.com", expected: "maindomain.com" },
        { name: "has http", url: "http://maindomain.com", expected: "maindomain.com" },
        { name: "has www", url: "www.maindomain.com", expected: "maindomain.com" },
        { name: "has protocol and www", url: "https://www.maindomain.com", expected: "maindomain.com" },
        { name: "has protocol and subdomain", url: "http://subdomain.maindomain.com", expected: "maindomain.com" },
        { name: "has www and subdomain", url: "www.subdomain.maindomain.com", expected: "maindomain.com" },
        { name: "is invalid", url: "example", expected: "" },
        { name: "is empty", url: "", expected: "" },
        { name: "is null", url: null, expected: "" },
    ];
    it.each(testCase)("return expected when url $name", ({ url, expected }) => {
        // Act
        const mainDomain = getMainDomain(url);

        // Assert
        expect(mainDomain).toBe(expected);
    });
});
