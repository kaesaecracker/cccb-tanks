import path from 'path';

export default {
    entry: './host.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: 'node',
    output: {
        filename: 'host.js',
        path: path.resolve('../dist'),
    },
};
