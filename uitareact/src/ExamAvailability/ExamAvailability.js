import React, { useState, useEffect } from "react";
import { Container, Row, Col, Breadcrumb, Spinner, Card } from "react-bootstrap";
import { useParams, useLocation } from "react-router-dom";
import globalVar from "../globalVar";

const ExamAvailability = () => {
  const { certificationId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vendorId = queryParams.get("vendorId");
  const certificationName = queryParams.get("certificationName");
  const certificateDetail = queryParams.get("certificateDetail");
  const status = queryParams.get("status");

  useEffect(() => {
    console.log("Certification ID:", certificationId);
    console.log("Vendor ID:", vendorId);
    console.log("Certification Name:", certificationName);
    console.log("Certificate Detail:", certificateDetail);
    console.log("Status:", status);
  }, [certificationId, vendorId, certificationName, certificateDetail, status]);

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificationId }), // Pass certificationId in the request body
      };

      try {
        const examsResponse = await fetch(
          globalVar.url + "available_exam",
          {
            ...requestOptions,
            body: JSON.stringify({ certificationId, vendorId }), // Include vendorId in the request body
          }
        );
        if (!examsResponse.ok) throw new Error("Exams fetch failed");
        const examsData = await examsResponse.json();
        setExams(examsData.data); // Update exams state
      } catch (error) {
        setError(error); // Handle fetch errors
      } finally {
        setLoading(false);
      }
    };

    if (certificationId && vendorId) {
      fetchData(); // Trigger data fetch only if certificationId and vendorId are available
    } else {
      setError(new Error("Missing certificationId or vendorId"));
      setLoading(false);
    }
  }, [certificationId, vendorId]);

  return (
    <section className="section section-exams inner-page">
      <Container>
        {loading ? (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ height: "250px" }}
          >
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            Error fetching data: {error.message}
          </div>
        ) : (
          <>
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="/certificates">
                Certificates
              </Breadcrumb.Item>
              <Breadcrumb.Item active>Exam Availability</Breadcrumb.Item>
            </Breadcrumb>

            <div className="mb-4">
              <h2 className="title page-title d-flex align-items-center">
                <span>{certificationName}</span>
                <span className="d-inline-flex ms-3">
                  <span className="certificateStatus-tag">
                    {status || "Completed"} {/* Default status */}
                  </span>
                </span>
              </h2>
              <p>{certificateDetail}</p> {/* Certificate details */}
            </div>

            <Row>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <Col sm={6} lg={4} xl={3} key={exam.examId}>
                    <Card className="">
                      <div className="course-thumbnail">
                        <Card.Img
                          className="w-100"
                          src={"/assets/images/courses/course-thumbnail.jpg"}
                          alt="certificate thumbnail"
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src =
                              "/assets/images/courses/course-thumbnail.jpg";
                          }}
                        />
                      </div>
                    </Card>
                    <h5 className="card-title course-title mb-3 mt-1 fw-bold">
                      {exam.exam_Name}
                    </h5>
                  </Col>
                ))
              ) : (
                <Col>
                  <div className="alert alert-info">
                    No exams available for this certificate.
                  </div>
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
