var courseMainForm = {
  formContext: null,
  formMode: null,

  onLoad: function (executionContext) {
    this.formContext = executionContext.getFormContext();
    this.formMode = this.formContext.ui.getFormType();

    // Call allFaculty only if the form is in Update mode
    if (this.formMode === 2) {
      // 2 indicates Update mode
      this.allFaculty();
    }
  },

  onSave: function (executionContext) {
    this.formContext = executionContext.getFormContext();
    this.allFaculty();
  },

  allFaculty: function () {
    var formContext = this.formContext;
    var courseId = formContext.data.entity
      .getId()
      .replace("{", "")
      .replace("}", "")
      .toLowerCase();
    // alert("courseId: " + courseId);

    // Corrected query string to exclude the base API URL and include a space after 'eq'
    var query = "?$filter=_ms_course_value eq " + courseId;
    console.log(query);

    Xrm.WebApi.retrieveMultipleRecords("ms_course_assignment", query).then(
      function (result) {
        if (result.entities.length > 0) {
          console.log(result.entities);
          var facultyPromises = result.entities.map(function (record) {
            var facultyId = record["_ms_faculty_value"];
            console.log("faculty id : " + facultyId);
            if (facultyId) {
              return Xrm.WebApi.retrieveRecord(
                "ms_faculty",
                facultyId,
                "?$select=ms_name"
              ).then(function (facultyResult) {
                return facultyResult.ms_name;
              });
            }
          });

          // Wait for all the faculty names to be retrieved
          Promise.all(facultyPromises)
            .then(function (facultyNames) {
              var faculties = facultyNames.join("\n");
              formContext.getAttribute("ms_allfaculty").setValue(faculties);
            })
            .catch(function (error) {
              //   alert("Error in retrieving faculty records");
              console.log(error.message);
            });
        }
      },
      function (error) {
        // alert("Error in retrieving course assignments");
        console.log(error.message);
      }
    );
  },
};
