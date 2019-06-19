{
    $(document).ready(function () {
        $(document).on("click", ".modify-status", function () {
            $(".mdl-dialog").css("display", "block");
            $(".modal-title").html(`${$(this).data("title")}`)
            $(".modal-body").html(`<p class="mdl-typography--text-center">Loading</p>`)
            $(".wrapper").css("display", "block");
            var baseUrl = window.location;
            var applicationId = $(this).data("id");
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
                        $(".modal-body").html(
                            `<p>
<b>Email : </b> ${data.email}
</p>
<p>
<b>BITS Id : </b> ${data.bitsId}
</p>
<p>
<b>Type : </b> ${data.applicationType}
</p>
<p>
<b>Status : <input class="mdl-textfield__input" type="text" id="application-status-edit" value="${data.status}">
</b>
</p>
<p>
<b>Info : <input class="mdl-textfield__input" type="text" id="application-info-edit" value="${data.info}">
</b>
</p>
<button class="mdl-button mdl-button--colored mdl-button--raised save-edit-application">Save</button>`
                        );
                        console.log(data.email)
                    }
                },
                error: function (xhr) {
                    alert(`Error : ${JSON.stringify(xhr)}`);
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