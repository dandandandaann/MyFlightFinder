var ghpages = require('gh-pages');

ghpages.publish(
    'public',
    {
        branch: 'gh-pages',
        repo: 'https://github.com/dandandandaann/MyFlightFinder.git',
        user: {
            name: 'Daniel Dutra',
            email: '7233639+dandandandaann@users.noreply.github.com'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)