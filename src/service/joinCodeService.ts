export class JoinCodeService {
    private static instance: JoinCodeService;
    private joinCodes: Map<string, number>; // Map of join codes to account IDs

    private constructor() {
        this.joinCodes = new Map<string, number>();
    }

    public static getInstance(): JoinCodeService {
        if (!JoinCodeService.instance) {
            JoinCodeService.instance = new JoinCodeService();
        }
        return JoinCodeService.instance;
    }

    generateJoinCode(accountId: number): string {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random 6-character code
        this.joinCodes.set(code, accountId);
        return code;
    }

    validateJoinCode(code: string): number | null {
        if (this.joinCodes.has(code)) {
            const accountId = this.joinCodes.get(code)!;
            this.joinCodes.delete(code); // Invalidate the code after use
            return accountId;
        }
        return null; // Invalid code
    }
}