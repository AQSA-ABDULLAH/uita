import React from "react";
import { Container, Spinner, Breadcrumb, Row, Col, Card } from "react-bootstrap";
import { useParams, useLocation, Link } from "react-router-dom";
import globalVar from "../../globalVar";

const LectureDetail = () => {
    const { lectureId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const examName = queryParams.get("examName");
    const certificationName = queryParams.get("certificationName");
    const certificateDetail = queryParams.get("certificateDetail");
    const status = queryParams.get("status");

    const [lectureDetails, setLectureDetails] = React.useState([]);
    const [exams, setExams] = React.useState([]);
    const [showLoader, setShowLoader] = React.useState(true);
    const [loadingExams, setLoadingExams] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const fetchLectureDetails = async () => {
            const formData = new FormData();
            formData.append("examId", lectureId);

            const requestOptions = {
                method: "POST",
                body: formData,
            };

            try {
                const response = await fetch(`${globalVar.url}related_lectures`, requestOptions);
                if (!response.ok) {
                    throw new Error("Failed to fetch lecture details");
                }
                const data = await response.json();
                setLectureDetails(data);
                setShowLoader(false);
            } catch (error) {
                console.error("Error fetching lecture details:", error);
                setShowLoader(false);
            }
        };

        const fetchExamAvailability = async () => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ certificationId: lectureId }), // Adjust this if needed
            };

            try {
                const examsResponse = await fetch(
                    globalVar.url + "available_exam",
                    requestOptions
                );
                if (!examsResponse.ok) throw new Error("Exams fetch failed");
                const examsData = await examsResponse.json();
                setExams(examsData.data);
                setLoadingExams(false);
            } catch (error) {
                setError(error);
                setLoadingExams(false);
            }
        };

        fetchLectureDetails();
        fetchExamAvailability();
    }, [lectureId]);

    return (
        <section className="section section-lecture-detail inner-page">
            <Container>
                {showLoader ? (
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "250px" }}>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : (
                    <>
                        <Breadcrumb>
                            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                            <Breadcrumb.Item href="/courses">Courses</Breadcrumb.Item>
                            <Breadcrumb.Item active>Lecture Details</Breadcrumb.Item>
                        </Breadcrumb>

                        <div className="lecture-details">
                            <h2 className="title page-title d-flex align-items-center">
                                <span>{certificationName}: {examName}</span>
                                <span className="d-inline-flex ms-3">
                                    <span className="certificateStatus-tag">
                                        {status || "Completed"}
                                    </span>
                                </span>
                            </h2>
                            <p>Certificate Details: {certificateDetail}</p>

                            {lectureDetails && lectureDetails.length > 0 ? (
                                lectureDetails.map((lecture, index) => (
                                    <div key={index} className="lecture-detail-item">
                                        <h4>{lecture.lecture_title}</h4>
                                        <p>{lecture.lecture_description}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No lectures found for this exam.</p>
                            )}

                            <div className="related-lectures mt-5">
                                <h5 className="fs-4 fw-bold">Related Lecture Series</h5>
                                {loadingExams ? (
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "250px" }}>
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger">Error fetching data: {error.message}</div>
                                ) : exams.length > 0 ? (
                                    <Row>
                                        {exams.slice(0, 4).map((exam) => (
                                            <Col sm={6} lg={4} xl={3} key={exam.examId}>
                                                <Link
                                                    to={`/lecture/${exam.examId}?examName=${encodeURIComponent(exam.exam_Name)}&certificationName=${encodeURIComponent(certificationName)}&certificateDetail=${encodeURIComponent(certificateDetail)}&status=${encodeURIComponent(status)}`}
                                                >
                                                    <Card className="">
                                                        <div className="course-thumbnail">
                                                            <Card.Img
                                                                className="w-100"
                                                                src={"/assets/images/courses/course-thumbnail.jpg"}
                                                                alt="certificate thumbnail"
                                                            />
                                                        </div>
                                                    </Card>
                                                    <h5 className="card-title course-title no-underline mb-3 mt-1 fw-bold text-black text-decoration-none">
                                                        {exam.exam_Name}
                                                    </h5>
                                                </Link>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <p>No related lectures available.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </Container>
        </section>
    );
};

export default LectureDetail;
