module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    jshint: {
      options: {
        esversion: 6,
        laxbreak: true
      },
      files: [
        "./*.js",
        "routes/**/*.js",
        "middleware/**/*.js",
        "schemas/**/*.js"
      ]
    },

    prettier: {
      files: {
        src: ["<%= jshint.files %>"]
      }
    },

    watch: {
      files: ["<%= jshint.files %>"],
      tasks: ["prettier", "jshint"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-prettier");

  grunt.registerTask("default", ["prettier", "jshint"]);
};
