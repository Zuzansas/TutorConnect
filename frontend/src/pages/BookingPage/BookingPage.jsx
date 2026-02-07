import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BookingPage.module.css';
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const BookingPage = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const fetchSlots = async () => {
        setLoading(true);
        try {

            const from = new Date(selectedDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(selectedDate);
            to.setHours(23, 59, 59, 999);

            const response = await fetch(
                `http://localhost:8080/api/slots/available?from=${from.toISOString()}&to=${to.toISOString()}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await response.json();
            setAvailableSlots(data);
        } catch (error) {
            toast.error("Błąd pobierania terminów");
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!selectedSlot) return;

        const result = await Swal.fire({
            title: 'Potwierdź rezerwację',
            text: `Czy chcesz zarezerwować termin ${new Date(selectedSlot.startTime).toLocaleString()}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d28b5b',
            confirmButtonText: 'Tak, rezerwuję',
            cancelButtonText: 'Anuluj'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('http://localhost:8080/api/reservations', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        offerId: offerId,
                        slotId: selectedSlot.id
                    })
                });

                if (response.ok) {
                    await Swal.fire('Sukces!', 'Twoja lekcja została zarezerwowana.', 'success');
                    navigate('/profile');
                } else {
                    const err = await response.json();
                    toast.error(err.message || "Błąd rezerwacji");
                }
            } catch (error) {
                toast.error("Błąd połączenia z serwerem");
            }
        }
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        setSelectedSlot(null);
    };

    return (
        <div className={styles.bookingContainer}>
            <div className={styles.bookingCard}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}><FaChevronLeft /> Wróć</button>
                    <h1 className={styles.titleText}>Wybierz termin</h1>
                </header>


                <div className={styles.datePicker}>
                    <button onClick={() => changeDate(-1)} className={styles.navBtn}><FaChevronLeft /></button>
                    <div className={styles.currentDate}>
                        <FaCalendarAlt className={styles.icon} />
                        <span>{selectedDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <button onClick={() => changeDate(1)} className={styles.navBtn}><FaChevronRight /></button>
                </div>

                <div className={styles.slotsGrid}>
                    {loading ? (
                        <p className={styles.statusMsg}>Szukam wolnych terminów...</p>
                    ) : availableSlots.length > 0 ? (
                        availableSlots.map(slot => (
                            <button
                                key={slot.id}
                                className={`${styles.slotBtn} ${selectedSlot?.id === slot.id ? styles.selected : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                            >
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </button>
                        ))
                    ) : (
                        <p className={styles.statusMsg}>Brak wolnych terminów na ten dzień.</p>
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.selectionInfo}>
                        <p>Wybrany termin:</p>
                        <strong>{selectedSlot ? new Date(selectedSlot.startTime).toLocaleString() : 'Wybierz godzinę'}</strong>
                    </div>
                    <button
                        className={styles.confirmBtn}
                        disabled={!selectedSlot}
                        onClick={handleBooking}
                    >
                        Zarezerwuj teraz
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BookingPage;