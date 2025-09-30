// Purpose: BrowserSync configuration file
export default {     
      proxy: 'http://localhost:5000', // server address
      files: ['./views/**/*.ejs', './public/**/*.*'], // files to watch
      ignore: ['node_modules'], // files to ignore
      open: false, // disable opening the browser
      notify: false, // disable notifications
};