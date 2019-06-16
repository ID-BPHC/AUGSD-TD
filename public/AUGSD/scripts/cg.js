{
    $(document).ready(function () {
        $(document).on("click", ".edit-application", function () {
            $(".mdl-dialog").css("display", "block");
            $(".mdl-dialog__content").html(`<p class="mdl-typography--text-center">Loading</p>`)
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
                        $(".mdl-dialog__content").html(`<p class="mdl-typography--text-center">An error occurred</p>`)
                        console.log(data.error)

                    } else {
                        $(".mdl-dialog__content").html(
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
        $(document).on("click", ".wrapper", function (e) {
            $(".mdl-dialog").css("display", "none");
            $(".wrapper").css("display", "none");


        })
    })

}