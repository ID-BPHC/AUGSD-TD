{
    $(document).ready(function () {
        $(document).on("click", ".modify-status", function () {
            $(".mdl-dialog").css("display", "block");
            $(".modal-title").html(`${$(this).data("title")}`)
            $(".modal-body").html(`<p class="mdl-typography--text-center">Loading</p>`)
            $(".wrapper").css("display", "block");
            var baseUrl = window.location.href;
            if (baseUrl[baseUrl.length - 1] == "/") {
                var endpoint = baseUrl + "modify-status";
            } else {
                var endpoint = baseUrl + "/modify-status";

            }
            var applicationId = $(this).data("id");
            $.ajax({
                url: "../../api/v1/cg-transcripts/status-types",
                success: function (statusTypes) {

                    $.ajax({
                        url: "../../api/v1/cg-transcripts",
                        data: {
                            id: applicationId
                        },
                        success: function (data) {
                            console.log(data)
                            if (data.error) {
                                $(".modal-body").html(`<p class="mdl-typography--text-center">An error occurred</p>`)
                                console.log(data.error)

                            } else {
                                var statusText = `<select name="status">`;
                                for (element of statusTypes) {
                                    statusText += `<option ${(element == data.status) ? "selected" : ""}>${element}</option>`
                                }
                                statusText += `</select>`
                                $(".modal-body").html(

                                    `<form action="${window.location.origin}/admin/cg-transcripts/modify-status" method="POST">

                                    <input type="hidden" name="applicationId" value="${data._id}">
                                    <p>
        <b>Email : </b> ${data.email}
        </p>
        <p>
        <b>BITS Id : </b> ${data.bitsId}
        </p>
        <p>
        <b>Status : ${statusText}
        </b>
        </p>
        <p>
        <b>Info : <textarea class="mdl-textfield__input" type="text" id="application-info" name="info">${data.info}</textarea>
        </b>
        </p>
        <button class="mdl-button mdl-button--colored mdl-button--raised save-edit-application">Save</button>
        </form>
        `
                                );
                                console.log(data.email)
                            }
                        },
                        error: function (xhr) {
                            alert(`Error : ${JSON.stringify(xhr)}`);
                        }
                    })
                },
                error: function (xhr) {
                    alert("Error: Could not fetch data from server. \n \n Details : " + JSON.stringify(xhr));
                }
            })


        })




        $(document).on("click", ".view-profile", function () {
            $(".mdl-dialog").css("display", "block");
            $(".modal-title").html(`${$(this).data("title")}`)
            $(".modal-body").html(`<p class="mdl-typography--text-center">Loading</p>`)
            $(".wrapper").css("display", "block");
            var baseUrl = window.location;
            var bitsId = $(this).data("bitsid");
            console.log(bitsId)
            $.ajax({
                url: "../../api/v1/cg-transcripts/users",
                data: {
                    bitsId: bitsId
                },
                success: function (data) {
                    console.log(data)
                    if (data.error) {
                        $(".modal-body").html(`<p class="mdl-typography--text-center">An error occurred</p>`)
                        console.log(data.error)

                    } else {
                        $(".modal-body").html(
                            `
                            <div>
                            <b>Name:</b> : ${data.name}
                            </div>
                            <div>
                            <b>Email Address:</b> : ${data.email}
                            </div>
                            <div>
                            <b>BITS Id:</b> : ${data.bitsId}
                            </div>
                            <div>
                            <b>Sex:</b> : ${data.sex}
                            </div>
                            <div>
                            <b>Mobile No.:</b> : +${data.mcode}-${data.mob}
                            </div>

                            `
                        );
                    }
                },
                error: function (xhr) {
                    alert(`Error : ${JSON.stringify(xhr)}`);
                }
            })

        })

        // Handle closing dialog boxes

        $(document).on("click", ".wrapper", function (e) {
            $(".mdl-dialog").css("display", "none");
            $(".wrapper").css("display", "none");


        })

        $(".close-modal").on("click", function () {
            $(".mdl-dialog").css("display", "none");
            $(".wrapper").css("display", "none");


        })
    })



}