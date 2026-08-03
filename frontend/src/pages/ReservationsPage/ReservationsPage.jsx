import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ReservationsPage.module.css';
import {
    FaCalendarCheck,
    FaRegClock,
    FaTrashAlt,
    FaFolderOpen,
    FaChevronUp,
    FaFileAlt,
    FaPlus,
    FaStar,
    FaBoxOpen,
    FaCalendarPlus,
    FaUser,
    FaUsers
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';

const ReservationsPage = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]); // NOWY STAN DLA PAKIETÓW
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
        await Promise.all([
            fetchUserPackages(),
            fetchReservations(),
            fetchUserReviews()
        ]);
        setLoading(false);
    };

    // NOWA FUNKCJA: Pobieranie aktywnych pakietów użytkownika
    const fetchUserPackages = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/packages/my-active', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPackages(data);
            }
        } catch (error) {
            console.error("Błąd pobierania pakietów:", error);
        }
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
                    <label style="font-size: 0.75rem; font-weight: 700; color: #d28b5b; text-transform: uppercase;">Tytuł materiałów</label>
                    <input id="swal-input-title" class="swal2-input" style="margin: 0; width: 100%; border-radius: 10px; border: 1px solid #f1ece8;" placeholder="np. Notatki z lekcji 1">
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.75rem; font-weight: 700; color: #d28b5b; text-transform: uppercase;">Opis (opcjonalnie)</label>
                    <textarea id="swal-input-desc" class="swal2-textarea" style="margin: 0; width: 100%; border-radius: 10px; border: 1px solid #f1ece8; min-height: 80px;" placeholder="Krótki opis..."></textarea>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.75rem; font-weight: 700; color: #d28b5b; text-transform: uppercase;">Załącznik</label>
                    <input type="file" id="swal-input-file" style="margin: 0; width: 100%;">
                </div>
            </div>
        `,
            focusConfirm: false,
            confirmButtonColor: '#d28b5b',
            confirmButtonText: 'Wyślij',
            showCancelButton: true,
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
            title: 'Czy na pewno chcesz odwołać lekcję?',
            text: '1 lekcja zostanie zwrócona do Twojego pakietu (jeśli odwołujesz min. 12h przed zajęciami).',
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
                    toast.success("Anulowano rezerwację. Stan pakietu został zaktualizowany.");
                    fetchInitialData(); // Odświeżamy rezerwacje i pakiet!
                } else {
                    const err = await response.json();
                    toast.error(err.message || "Błąd podczas odwoływania.");
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

            {/* NAGŁÓWEK */}
            <div className={styles.headerSection}>
                <h1><FaCalendarCheck /> Twoje Konto Lekcji i Rezerwacje</h1>
                <p>Zarządzaj swoimi pakietami oraz terminami zajęć</p>
            </div>


            {userRole !== 'ADMIN' && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.3rem', color: '#d28b5b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaBoxOpen /> Twoje Wykupione Pakiety
                    </h2>

                    {packages.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {packages.map(pkg => (
                                <div key={pkg.id} style={{
                                    background: '#ffffff',
                                    padding: '20px',
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                    border: '1px solid #f1ece8',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justify: 'space-between',
                                    gap: '12px'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: pkg.lessonOffer.lessonType === 'GROUP' ? '#e6f4ff' : '#fff0f6',
                                                color: pkg.lessonOffer.lessonType === 'GROUP' ? '#0070f3' : '#c01e5a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {pkg.lessonOffer.lessonType === 'GROUP' ? <FaUsers /> : <FaUser />}
                                                {pkg.lessonOffer.lessonType === 'GROUP' ? 'Grupowe' : 'Indywidualne'}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                                Poziom: <b>{pkg.lessonOffer.level}</b>
                                            </span>
                                        </div>

                                        <h3 style={{ margin: '10px 0 5px 0', fontSize: '1.1rem', color: '#2c3e50' }}>
                                            {pkg.lessonOffer.title}
                                        </h3>

                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                            Pozostało do wykorzystania: <b style={{ color: '#2ecc71', fontSize: '1.1rem' }}>{pkg.remainingLessons}</b> lekcji
                                        </p>

                                        {pkg.expiresAt && (
                                            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#95a5a6' }}>
                                                Ważny do: {new Date(pkg.expiresAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => navigate(`/book/${pkg.id}`)}
                                        style={{
                                            background: '#d28b5b',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '10px 15px',
                                            borderRadius: '10px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: '0.3s'
                                        }}
                                    >
                                        <FaCalendarPlus /> Zarezerwuj lekcję w kalendarzu
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            Nie masz obecnie żadnych aktywnych pakietów lekcji. Kup pakiet w zakładce Oferty!
                        </div>
                    )}
                </div>
            )}

            {/* SEKCJA 2: LISTA REZERWACJI */}
            <h2 style={{ fontSize: '1.3rem', color: '#2c3e50', marginBottom: '15px' }}>
                Zaplanowane i Odbyte Zajęcia
            </h2>

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
                ) : <div className={styles.emptyState}>Brak zarezerwowanych lekcji.</div>}
            </div>
        </div>
    );
};

export default ReservationsPage;