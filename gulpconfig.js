module.exports = {
    project: {
        dev: {
            hostname: 'brkstn.dev'
        }
    },
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
            'resources/views/**/*.+(php|html|md|hbs|json)',
            '.env'
        ]
    },
    copy: [
        {
            src: [
                'resources/views/.htaccess'
            ],
            dest: 'httpdocs/'
        },
        {
            src: [
                'resources/assets/img/**/*.+(jpg|jpeg|gif|png|svg)'
            ],
            dest: 'httpdocs/assets/img/'
        },
        {
            src: [
                'resources/assets/fonts/**/*'
            ],
            dest: 'httpdocs/assets/fonts/'
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
