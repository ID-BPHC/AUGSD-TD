module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    checkLint: {
      target: [
        "./*.js",
        "routes/**/*.js",
        "middleware/**/*.js",
        "schemas/**/*.js"
      ]
    },
    fixLint: {
      options: {
        fix: true
      },
      target: ["<%= checkLint.target %>"]
    },
    prettier: {
      files: {
        src: ["<%= checkLint.target %>"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-eslint");
  grunt.renameTask("eslint", "checkLint");

  grunt.loadNpmTasks("grunt-eslint");
  grunt.renameTask("eslint", "fixLint");

  grunt.loadNpmTasks("grunt-prettier");

  grunt.registerTask("default", ["checkLint"]);
  grunt.registerTask("fix", ["prettier", "fixLint"]);
};
