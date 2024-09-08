import React, { useState, useEffect } from "react";
import { Container, Spinner, Breadcrumb, Row, Col, Card } from "react-bootstrap";
import { useParams, useLocation, Link } from "react-router-dom";
import globalVar from "../../globalVar";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const LectureDetail = () => {
    const { lectureId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const examName = queryParams.get("examName");
    const certificationName = queryParams.get("certificationName");
    const certificateDetail = queryParams.get("certificateDetail");
    const status = queryParams.get("status");

    const [lectureDetails, setLectureDetails] = useState([]);
    const [activeLecture, setActiveLecture] = useState(null);
    const [exams, setExams] = useState([]);
    const [showLoader, setShowLoader] = useState(true);
    const [loadingExams, setLoadingExams] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLectureDetails = async () => {
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ examId: lectureId }),
            };

            try {
                const response = await fetch(`${globalVar.url}related_lectures`, requestOptions);
                if (!response.ok) {
                    throw new Error("Failed to fetch lecture details");
                }
                const data = await response.json();
                setLectureDetails(data.data);
                setActiveLecture(data.data[0]); // Set the first lecture as the default active one
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
                body: JSON.stringify({ certificationId: lectureId }),
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

    const handleLectureClick = (lecture) => {
        setActiveLecture(lecture);  // Switch the video on click
    };

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

                            {activeLecture && (
                                <div className="active-lecture">
                                    <h4>{activeLecture.video_Name}</h4>
                                    <p>{activeLecture.video_Description}</p>
                                    <div className="video-container" dangerouslySetInnerHTML={{ __html: activeLecture.dailymotion_url }} />

                                    <div className="d-flex justify-content-between">
                                        <div className="social-share mt-3">
                                            <h5>Share:</h5>
                                            <span><i className="fab fa-facebook me-2 fs-2 text-primary"></i></span>
                                            <span><i className="fab fa-twitter me-2 fs-2 text-primary"></i></span>
                                            <span><i className="fab fa-linkedin me-2 fs-2 text-primary"></i></span>
                                        </div>

                                        <div className="useful-links mt-3">
                                            <h5>Useful Links:</h5>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="related-lectures mt-5">
                                <h5 className="fs-4 fw-bold mb-5">More Lectures in this Series</h5>
                                {lectureDetails && lectureDetails.length > 1 ? (
                                    <table className="table" style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
                                        <tbody>
                                            {lectureDetails.slice(1).map((lecture, index) => (
                                                <tr
                                                    key={index}
                                                    onClick={() => handleLectureClick(lecture)}
                                                    style={{ cursor: "pointer", borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd" }}
                                                >
                                                    <td style={{ padding: " 0" }}>
                                                        <h6 className="text-dark">{lecture.video_Name}</h6>
                                                        <p>{lecture.video_Description}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No more lectures available.</p>
                                )}
                            </div>


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
