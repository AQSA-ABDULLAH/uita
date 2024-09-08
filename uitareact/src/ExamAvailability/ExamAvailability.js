import React, { useState, useEffect } from "react";
import { Container, Row, Col, Breadcrumb, Spinner, Card } from "react-bootstrap";
import { useParams, useLocation, Link } from "react-router-dom";
import globalVar from "../globalVar";

const ExamAvailability = () => {
  const { certificationId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vendorId = queryParams.get("vendorId");
  const certificationName = queryParams.get("certificationName");
  const certificateDetail = queryParams.get("certificateDetail");
  const status = queryParams.get("status");

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificationId, vendorId }),
      };

      try {
        const examsResponse = await fetch(
          globalVar.url + "available_exam",
          requestOptions
        );
        if (!examsResponse.ok) throw new Error("Exams fetch failed");
        const examsData = await examsResponse.json();
        setExams(examsData.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (certificationId && vendorId) {
      fetchData();
    } else {
      setError(new Error("Missing certificationId or vendorId"));
      setLoading(false);
    }
  }, [certificationId, vendorId]);

  return (
    <section className="section section-exams inner-page">
      <Container>
        {loading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ height: "250px" }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="alert alert-danger">Error fetching data: {error.message}</div>
        ) : (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="/certificates">Certificates</Breadcrumb.Item>
              <Breadcrumb.Item active>Exam Availability</Breadcrumb.Item>
            </Breadcrumb>

            <div className="mb-4">
              <h2 className="title page-title d-flex align-items-center">
                <span>{certificationName}</span>
                <span className="d-inline-flex ms-3">
                  <span className="certificateStatus-tag">
                    {status || "Completed"}
                  </span>
                </span>
              </h2>
              <p>{certificateDetail}</p>
            </div>

            <Row>
              {exams.length > 0 ? (
                exams.map((exam) => (
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
                ))
              ) : (
                <Col>
                  <div className="alert alert-info">No exams available for this certificate.</div>
                </Col>
              )}
            </Row>
          </>
        )}
      </Container>
    </section>
  );
};

export default ExamAvailability;
