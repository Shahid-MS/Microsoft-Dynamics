var resultMainForm = {
  onChange: function (executionContext) {
    formContext = executionContext.getFormContext();
    formMode = formContext.ui.getFormType();

    var student = formContext.getAttribute("ms_student").getValue();

    if (student != null) {
      var studentid = student[0].id
        .replace("{", "")
        .replace("}", "")
        .toLowerCase(); // Get current Student record ID;
      console.log(student);
      // alert(studentid);
      Xrm.WebApi.retrieveRecord(
        "ms_student",
        studentid,
        "?$select=_ms_courseenrolled_value"
      ).then(
        function success(result) {
          console.log(result);
          var courseId = result._ms_courseenrolled_value;
          // alert(courseId);
          if (courseId != null) {
            // Set the course lookup field with the retrieved course
            var lookupValue = [
              {
                id: courseId,
                entityType: "ms_course",
              },
            ];
            formContext.getAttribute("ms_course").setValue(lookupValue); // Set course field
          }
        },
        function error(error) {
          // alert("error occured");
          console.log(error.message);
        }
      );
    }
  },
};
