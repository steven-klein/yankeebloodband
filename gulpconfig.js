module.exports = {
    project: {
        dev: {
            hostname: 'brkstn.dev'
        }
    },
    js: {
        entrypoint: 'app.js',
        src: 'resources/assets/js/',
        dest: 'docs/assets/js/'
    },
    css: {
        entrypoint: 'app.css',
        src: 'resources/assets/css/',
        dest: 'docs/assets/css/'
    },
    files: {
        src: [
            'resources/views/**/*.+(php|html|md|hbs|json)',
            '.env'
        ]
    },
    copy: [
        {
            src: [
                'resources/views/CNAME',
                'resources/views/favicon.ico'
            ],
            dest: 'docs/'
        },
        {
            src: [
                'resources/assets/images/**/*.+(jpg|jpeg|gif|png|svg)'
            ],
            dest: 'docs/assets/images/'
        },
        {
            src: [
                'resources/assets/fonts/**/*'
            ],
            dest: 'docs/assets/fonts/'
        },
        {
            src: [
                'resources/assets/js/bit/**/*'
            ],
            dest: 'docs/assets/js/bit/'
        },
        {
            src: [
                'node_modules/font-awesome/fonts/*'
            ],
            dest: 'docs/assets/fonts/'
        }
    ],
    autoprefix: [
        'last 2 versions',
        'ie >= 8',
        'ios > 6',
        'safari >= 5',
        'android >= 4'
    ],
    data: 'resources/views/data.json',
    handlebars: {
        src: [
            'resources/views/pages/**/*.hbs'
        ],
        dest: 'docs',
        ignorePartials: false,
        batch : ['resources/views/partials'],
        helpers : {
            entities : function(str){
                var map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };

                return str.replace(/[&<>"']/g, function(m) { return map[m]; });
            }
        }
    }
}
