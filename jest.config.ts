import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    verbose: true,
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node"
};

export default config;