let questions = [];
let answerVersions = {};
let currentVersionIndex = {};
        
// Load CSV data
$(document).ready(function () {
    console.log("Document is ready");
    $.get("data/questions.csv", function (data) {
        const lines = data.split("\n");
        lines.forEach(line => {
            const [qNum, question, answer] = line.split(",");
            questions.push({ qNum, question, answer });
            answerVersions[qNum] = [answer];
            currentVersionIndex[qNum] = 0;
        });
        populateQuestions();
    });

    $("#questionSelect, #conditionSelect").change(updateQuestionAndAnswer);
    
    $("#sendBtn").click(function () {
        const selectedQ = $("#questionSelect").val();
        const feedback = $("#feedbackText").val().trim();
        if (feedback) {
            answerVersions[selectedQ].push(answerVersions[selectedQ][currentVersionIndex[selectedQ]] + " " + feedback);
            currentVersionIndex[selectedQ] = answerVersions[selectedQ].length - 1;
            // $("#answerText").val(answerVersions[selectedQ][currentVersionIndex[selectedQ]]);
            displayAnswerDiff(selectedQ);
            $("#feedbackText").val("");
        }
    });
    
    $("#leftBtn").click(function () {
        const selectedQ = $("#questionSelect").val();
        if (currentVersionIndex[selectedQ] > 0) {
            currentVersionIndex[selectedQ]--;
            displayAnswerDiff(selectedQ);            
        }
    });
    
    $("#rightBtn").click(function () {
        const selectedQ = $("#questionSelect").val();
        if (currentVersionIndex[selectedQ] < answerVersions[selectedQ].length - 1) {
            currentVersionIndex[selectedQ]++;
            displayAnswerDiff(selectedQ);
        }
    });
    
    $("#submitBtn").click(function () {
        alert("Answer submitted: " + $("#answerText").val());
    });
});

function populateQuestions() {
    const questionSelect = $("#questionSelect");
    questionSelect.empty();
    for (let i = 1; i <= 20; i++) {
        questionSelect.append(`<option value="${i}">${i}</option>`);
    }
    updateQuestionAndAnswer();
}

function updateQuestionAndAnswer() {
    const selectedQ = $("#questionSelect").val();
    const selectedCondition = $("#conditionSelect").val();
    const record = questions.find(q => q.qNum == selectedQ);
    
    if (record) {
        $("#questionText").val(record.question);
        if (selectedCondition == "1") {
            $("#answerText").val(""); // Leave empty for condition 1
        } else if (selectedCondition == "2") {
            $("#answerText").val(answerVersions[selectedQ][0]);
        } else if (selectedCondition == "3") {
            displayAnswerDiff(selectedQ);
            // $("#answerText").val(answerVersions[selectedQ][currentVersionIndex[selectedQ]]);
        }   
    }
    if (selectedCondition == "3") {
        $("#extraControls, #feedbackSection").show();
        $("#answerText").attr("contenteditable", false);
    } else {
        $("#extraControls, #feedbackSection").hide();
        $("#answerText").attr("contenteditable", true);
    }
}

function displayAnswerDiff(selectedQ) {
    const index = currentVersionIndex[selectedQ];
    const previousVersion = index > 0 ? answerVersions[selectedQ][index - 1] : "";
    const currentVersion = answerVersions[selectedQ][index];
    
    let diffHtml = diffText(previousVersion, currentVersion);
    console.log(diffHtml);
    $("#answerText").html(diffHtml);
}

function diffText(oldText, newText) {
    const diff = Diff.diffWordsWithSpace(oldText, newText); // Word-level diff, preserving spaces
    let result = "";
    
    diff.forEach(part => {
        if (part.added) {
            result += `<span class="added">+${part.value}</span> `;
        } else if (part.removed) {
            result += `<span class="removed">-${part.value}</span> `;
        } else {
            result += part.value;
        }
    });
    
    return result;
}

