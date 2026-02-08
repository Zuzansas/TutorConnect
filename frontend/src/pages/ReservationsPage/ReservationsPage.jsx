import React, { useState, useEffect } from 'react';
import styles from './ReservationsPage.module.css';
import {
    FaCalendarCheck,
    FaRegClock,
    FaTrashAlt,
    FaFolderOpen,
    FaChevronUp,
    FaFileAlt,
    FaPlus,
    FaStar
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';

const ReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [expandedRes, setExpandedRes] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [materials, setMaterials] = useState({});
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchReservations(), fetchUserReviews()]);
        setLoading(false);
    };

    const fetchReservations = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/reservations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const sorted = data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            setReservations(sorted);
        } catch (error) {
            toast.error("Nie udało się pobrać rezerwacji.");
        }
    };

    const fetchUserReviews = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:8080/api/reviews/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUserReviews(data);
            }
        } catch (error) {
            console.error("Błąd pobierania opinii:", error);
        }
    };

    const fetchMaterials = async (id) => {
        if (materials[id]) return;
        try {
            const response = await fetch(`http://localhost:8080/api/reservations/${id}/materials`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMaterials(prev => ({ ...prev, [id]: data }));
        } catch (error) {
            toast.error("Błąd pobierania materiałów.");
        }
    };

    const getExistingReview = (lessonOfferId) => {
        return userReviews.find(r => r.reviewedLessonId === lessonOfferId);
    };

    const handleAddReview = async (res) => {
        const { value: formValues } = await Swal.fire({
            title: 'Oceń lekcję',
            html: `
                <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
                    <label>Ocena (1-5):</label>
                    <input type="number" id="review-rating" class="swal2-input" min="1" max="5" value="5">
                    <label>Twoja opinia:</label>
                    <textarea id="review-message" class="swal2-textarea" placeholder="Napisz kilka słów o zajęciach..."></textarea>
                </div>
            `,
            confirmButtonColor: '#d28b5b',
            confirmButtonText: 'Dodaj opinię',
            preConfirm: () => ({
                rating: document.getElementById('review-rating').value,
                message: document.getElementById('review-message').value
            })
        });

        if (formValues) {
            try {
                console.log("Przesyłam ID oferty:", res.lessonOfferId);
                const response = await fetch('http://localhost:8080/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        reviewedLessonId: res.lessonOfferId,
                        message: formValues.message,
                        rating: parseInt(formValues.rating, 10)
                    })
                });

                if (response.ok) {
                    toast.success("Dziękujemy za opinię!");
                    fetchUserReviews();
                }
            } catch (error) {
                toast.error("Błąd dodawania opinii.");
            }
        }
    };

    const handleDeleteReview = async (reviewId) => {
        const result = await Swal.fire({
            title: 'Usunąć opinię?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Tak, usuń'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    toast.success("Opinia została usunięta.");
                    fetchUserReviews();
                }
            } catch (error) {
                toast.error("Błąd usuwania opinii.");
            }
        }
    };

    const handleOpenMaterialsModal = async (reservationId) => {
        const { value: formValues } = await Swal.fire({
            title: 'Dodaj materiały do lekcji',
            html: `
            <div style="display: flex; flex-direction: column; gap: 15px; text-align: left; font-family: 'Inter', sans-serif; padding: 10px;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.75rem; font-weight: 700; color: #d28b5b; text-transform: uppercase; letter-spacing: 0.5px;">Tytuł materiałów</label>
                    <input id="swal-input-title" class="swal2-input" style="margin: 0; width: 100%; border-radius: 10px; border: 1px solid #f1ece8;" placeholder="np. Notatki z lekcji 1">
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.75rem; font-weight: 700; color: #d28b5b; text-transform: uppercase; letter-spacing: 0.5px;">Opis (opcjonalnie)</label>
                    <textarea id="swal-input-desc" class="swal2-textarea" style="margin: 0; width: 100%; border-radius: 10px; border: 1px solid #f1ece8; min-height: 80px;" placeholder="Krótki opis dla ucznia..."></textarea>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.75rem; font-weight: 700; color: #d28b5b; text-transform: uppercase; letter-spacing: 0.5px;">Załącznik</label>
                    <div style="position: relative; width: 100%;">
                        <input type="file" id="swal-input-file" style="display: none;">
                        <label for="swal-input-file" id="file-label" style="
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            gap: 10px;
                            padding: 12px; 
                            background: #fcfaf8; 
                            border: 2px dashed #d28b5b; 
                            border-radius: 10px; 
                            cursor: pointer; 
                            color: #d28b5b; 
                            font-weight: 600;
                            transition: all 0.3s ease;
                        ">
                            <i class="fas fa-cloud-upload-alt"></i> 
                            <span id="file-name">Kliknij, aby wybrać plik</span>
                        </label>
                    </div>
                </div>
            </div>
        `,
            focusConfirm: false,
            confirmButtonColor: '#d28b5b',
            confirmButtonText: 'Wyślij do ucznia',
            showCancelButton: true,
            cancelButtonText: 'Anuluj',
            customClass: {
                popup: styles.swalSoftPopup
            },
            didOpen: () => {
                const fileInput = document.getElementById('swal-input-file');
                const fileLabel = document.getElementById('file-label');
                const fileNameDisplay = document.getElementById('file-name');

                fileInput.onchange = () => {
                    if (fileInput.files.length > 0) {
                        const name = fileInput.files[0].name;
                        fileNameDisplay.innerText = name.length > 25 ? name.substring(0, 22) + '...' : name;
                        fileLabel.style.background = '#e6f4ff';
                        fileLabel.style.borderStyle = 'solid';
                    }
                };
            },
            preConfirm: () => {
                const title = document.getElementById('swal-input-title').value;
                const description = document.getElementById('swal-input-desc').value;
                const file = document.getElementById('swal-input-file').files[0];

                if (!title || !file) {
                    Swal.showValidationMessage('Musisz podać tytuł i wybrać plik!');
                    return false;
                }
                return { title, description, file };
            }
        });

        if (formValues) {
            const formData = new FormData();
            formData.append('file', formValues.file);
            formData.append('title', formValues.title);
            formData.append('description', formValues.description);

            try {
                const response = await fetch(`http://localhost:8080/api/reservations/${reservationId}/materials`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    toast.success("Materiały zostały dodane!");
                    setMaterials(prev => {
                        const newMaterials = { ...prev };
                        delete newMaterials[reservationId];
                        return newMaterials;
                    });
                    if (expandedRes === reservationId) fetchMaterials(reservationId);
                } else {
                    toast.error("Błąd podczas wysyłania pliku.");
                }
            } catch (error) {
                toast.error("Błąd połączenia z serwerem.");
            }
        }
    };

    const handleCancel = async (id) => {
        const result = await Swal.fire({
            title: 'Czy na pewno?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Tak, odwołaj'
        });

        if (result.isConfirmed) {
            try {
                let url = userRole === 'ADMIN'
                    ? `http://localhost:8080/api/reservations/${id}`
                    : `http://localhost:8080/api/reservations/${id}/cancel`;
                let method = userRole === 'ADMIN' ? 'DELETE' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    toast.success("Anulowano rezerwację.");
                    fetchReservations();
                }
            } catch (error) {
                toast.error("Błąd połączenia.");
            }
        }
    };

    const toggleExpand = (id) => {
        if (expandedRes === id) setExpandedRes(null);
        else {
            setExpandedRes(id);
            fetchMaterials(id);
        }
    };

    if (loading) return <div className={styles.loader}>Pobieranie Twoich zajęć...</div>;

    return (
        <div className={styles.container}>
            <ToastContainer />
            <div className={styles.headerSection}>
                <h1><FaCalendarCheck /> Twoje Rezerwacje</h1>
                <p>Lista Twoich nadchodzących i minionych zajęć</p>
            </div>

            <div className={styles.timeline}>
                {reservations.length > 0 ? (
                    reservations.map((res) => {

                        const isPast = new Date(res.startTime) < new Date();
                        const existingReview = getExistingReview(res.lessonOfferId);

                        return (
                            <div key={res.id} className={`${styles.resCard} ${isPast ? styles.past : ''}`}>
                                <div className={styles.resMain}>
                                    <div className={styles.dateInfo}>
                                        <span className={styles.day}>{new Date(res.startTime).getDate()}</span>
                                        <span className={styles.month}>
                                            {new Date(res.startTime).toLocaleString('pl-PL', { month: 'short' })}
                                        </span>
                                    </div>

                                    <div className={styles.details}>
                                        <h3>{res.lessonTitle}</h3>
                                        <p className={styles.time}>
                                            <FaRegClock /> {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            - {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className={styles.student}>Uczeń: <strong>{res.studentName}</strong></p>
                                    </div>

                                    <div className={styles.statusBadge} data-status={res.status}>
                                        {res.status}
                                    </div>

                                    <div className={styles.actions}>
                                        <button onClick={() => toggleExpand(res.id)} className={styles.materialsBtn}>
                                            {expandedRes === res.id ? <FaChevronUp /> : <FaFolderOpen />} Materiały
                                        </button>
                                        {isPast && res.status === 'COMPLETED' && userRole !== 'ADMIN' && (
                                            existingReview ? (
                                                <button onClick={() => handleDeleteReview(existingReview.id)} className={styles.deleteReviewBtn}>
                                                    <FaStar /> <FaTrashAlt />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleAddReview(res)} className={styles.addReviewBtn}>
                                                    <FaStar /> Oceń
                                                </button>
                                            )
                                        )}


                                        {userRole === 'ADMIN' && (
                                            <button onClick={() => handleOpenMaterialsModal(res.id)} className={styles.addBtn}>
                                                <FaPlus />
                                            </button>
                                        )}


                                        {res.status !== 'CANCELLED' && (userRole === 'ADMIN' || !isPast) && (
                                            <button onClick={() => handleCancel(res.id)} className={styles.cancelBtn}>
                                                <FaTrashAlt />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {expandedRes === res.id && (
                                    <div className={styles.expandedContent}>
                                        <h4>Dostępne materiały:</h4>
                                        {materials[res.id]?.length > 0 ? (
                                            <ul className={styles.materialsList}>
                                                {materials[res.id].map((mat, index) => (
                                                    <li key={index}>
                                                        <FaFileAlt />
                                                        <a href={mat.fileUrl} target="_blank" rel="noreferrer">{mat.title}</a>
                                                        <span>{mat.description}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p>Brak materiałów.</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : <div className={styles.emptyState}>Brak rezerwacji.</div>}
            </div>
        </div>
    );
};

export default ReservationsPage;