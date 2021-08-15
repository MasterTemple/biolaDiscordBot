module.exports = async(config, classId) =>{
    return new Promise( (canvasResolve, canvasReject) => {
        const axios = require('axios')
        const url = `https://canvas.biola.edu/courses/${classId}/grades`

        axios({
            url: url,
            method: "GET",
            headers: {
                cookie: `canvas_session=${config.canvasSession};`,
            }
        }).then( (response) => {
            const jsdom = require('jsdom')
            let { JSDOM }= jsdom
            const { document } = (new JSDOM(response.data)).window;

            let assignment_groups_string = response.data.toString().match(/(?<="assignment_groups":).*(?=,"assignment_sort_options)/g)[0]
            let assignment_groups = eval(assignment_groups_string)
            let assignmentIds = []
            assignment_groups.forEach( (each_assignment_group) => {
                each_assignment_group.assignments.forEach( (each_assignment) => {
                    assignmentIds.push(each_assignment.id)
                })
            })
            let scores = []
            assignmentIds.forEach( (each_assignment_id) => {
                let score = get_data(document, each_assignment_id)
                scores.push(score)
            })
            canvasResolve(scores)
            console.table(scores)
        }).catch(e => console.log(e))


        function get_data(document, assignmentId) {
            let assignment = {}

            assignment.assignmentName = document.querySelector(`#submission_${assignmentId} > th > a`).textContent
            assignment.assignmentType = document.querySelector(`#submission_${assignmentId} > th > div`).textContent
            try{assignment.myScore = document.querySelector(`#submission_${assignmentId} > td.assignment_score > div > span.tooltip > span`).textContent.match(/[\d\.]+/g)[0]}catch{assignment.myScore = "0"}
            assignment.maxPoints = document.querySelector(`#submission_${assignmentId} > td.possible.points_possible`).textContent.match(/[\d\.]+/g)[0]
            try{assignment.averageScore = document.querySelector(`#score_details_${assignmentId} > tbody > tr > td:nth-child(1)`).textContent.match(/[\d\.]+/g)[0]}catch{assignment.averageScore = "0"}
            try{assignment.highestScore = document.querySelector(`#score_details_${assignmentId} > tbody > tr > td:nth-child(2)`).textContent.match(/[\d\.]+/g)[0]}catch{assignment.highestScore = "0"}
            try{assignment.lowestScore = document.querySelector(`#score_details_${assignmentId} > tbody > tr > td:nth-child(3)`).textContent.match(/[\d\.]+/g)[0]}catch{assignment.lowestScore = "0"}
            return assignment

        }
    })

}
