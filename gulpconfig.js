module.exports = {
    js: {
        entrypoint: 'app.js',
        src: 'resources/assets/js/',
        dest: 'httpdocs/assets/js/'
    },
    css: {
        entrypoint: 'app.css',
        src: 'resources/assets/css/',
        dest: 'httpdocs/assets/css/'
    },
    files: {
        src: [
            'httpdocs/**/*.html'
        ]
    },
    copy: [
        {
            src: [
                'resources/assets/images/**/*.jpg',
                'resources/assets/images/**/*.jpeg',
                'resources/assets/images/**/*.gif',
                'resources/assets/images/**/*.png',
                'resources/assets/images/**/*.svg'
            ],
            dest: 'httpdocs/assets/images/'
        },
        {
            src: 'resources/assets/fonts/**/*',
            dest: 'httpdocs/assets/fonts/',
        },
        {
            src: 'node_modules/font-awesome/fonts/**/*',
            dest: 'httpdocs/assets/fonts/',
        },
        {
            src: 'resources/assets/css/_lib/skins/**/*',
            dest: 'httpdocs/assets/css/skins/',
        },
        {
            src: 'resources/assets/js/lib/**/*',
            dest: 'httpdocs/assets/js/lib/',
        }
    ],
    autoprefix: [
        'last 2 versions',
        'ie >= 8',
        'ios > 6',
        'safari >= 5',
        'android >= 4'
    ]
}
