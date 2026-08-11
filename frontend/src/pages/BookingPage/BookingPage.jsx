import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BookingPage.module.css';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const BookingPage = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();

    const [userPackage, setUserPackage] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchPackageDetails();
    }, [packageId]);

    useEffect(() => {
        if (userPackage) {
            fetchAndFilterSlots();
        }
    }, [selectedDate, userPackage]);

    const fetchPackageDetails = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/packages/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const packages = await response.json();
                const currentPkg = packages.find(p => p.id === packageId);

                if (currentPkg) {
                    setUserPackage(currentPkg);
                } else {
                    toast.error("Brak dostępu lub pakiet wygasł");
                    navigate('/reservations');
                }
            }
        } catch (error) {
            toast.error("Błąd pobierania informacji o pakiecie");
        }
    };

    const fetchAndFilterSlots = async () => {
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

            if (response.ok) {
                const allSlots = await response.json();

                const normalize = (str) => (str ? str.toString().trim().toLowerCase() : '');

                const isGroupType = (type) => {
                    const norm = normalize(type);
                    return norm.includes('group') || norm.includes('grup');
                };

                const pkgLevel = normalize(userPackage.lessonOffer.level);
                const isPkgGroup = isGroupType(userPackage.lessonOffer.lessonType);

                const matchingSlots = allSlots.filter(slot => {
                    const slotLevel = normalize(slot.level);
                    const isSlotGroup = isGroupType(slot.lessonType);

                    const levelMatches = slotLevel === pkgLevel;
                    const typeMatches = isSlotGroup === isPkgGroup;

                    return levelMatches && typeMatches;
                });

                setAvailableSlots(matchingSlots);
            }
        } catch (error) {
            toast.error("Błąd pobierania terminów");
        } finally {
            setLoading(false);
        }
    };

    const isTooLateToBook = (startTime) => {
        const now = new Date();
        const slotTime = new Date(startTime);
        const diffInHours = (slotTime - now) / (1000 * 60 * 60);
        return diffInHours < 24;
    };

    const handleBooking = async () => {
        if (!selectedSlot || !userPackage) return;


        if (isTooLateToBook(selectedSlot.startTime)) {
            toast.error("Rezerwacji można dokonać najpóźniej na 24h przed zajęciami.");
            return;
        }

        const result = await Swal.fire({
            title: 'Potwierdź rezerwację',
            html: `
                <div style="text-align: left; font-family: sans-serif; font-size: 0.95rem;">
                    <p>Wybierasz termin dla pakietu: <b>${userPackage.lessonOffer.title}</b></p>
                    <p>Data zajęć: <b>${new Date(selectedSlot.startTime).toLocaleString()}</b></p>
                    <p style="color: #777;">Po utworzeniu rezerwacji Twój pakiet zmniejszy się o 1 lekcję.</p>

                    ${selectedSlot.description ? `
                <div style="background: #fdf2eb; border-left: 4px solid #d28b5b; padding: 10px 12px; border-radius: 6px; margin: 12px 0;">
                    <b style="color: #d28b5b; font-size: 0.85rem;">📌 Temat / Opis zajęć:</b>
                    <p style="margin: 4px 0 0 0; color: #444; font-size: 0.9rem;">${selectedSlot.description}</p>
                </div>
            ` : ''}
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d28b5b',
            cancelButtonColor: '#95a5a6',
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
                        userPackageId: userPackage.id,
                        slotId: selectedSlot.id
                    })
                });

                if (response.ok) {
                    await Swal.fire('Zarezerwowano!', 'Twój termin został pomyślnie dodany.', 'success');
                    navigate('/reservations');
                } else {
                    const err = await response.json();
                    toast.error(err.message || "Nie udało się zarezerwować terminu.");
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
                    <h1 className={styles.titleText}>Wybierz termin zajęć</h1>
                    {userPackage && (
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#d28b5b', fontWeight: 'bold' }}>
                            Pakiet: {userPackage.lessonOffer.title} ({userPackage.lessonOffer.level})
                        </p>
                    )}
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
                        <p className={styles.statusMsg}>Szukam zgodnych wolnych terminów...</p>
                    ) : availableSlots.length > 0 ? (
                        availableSlots.map(slot => {
                            const disabled = isTooLateToBook(slot.startTime);
                            const isSelected = selectedSlot?.id === slot.id;


                            const isGroup = slot.lessonType && slot.lessonType.toString().toLowerCase().includes('grup');


                            const maxCapacity = slot.capacity || (isGroup ? 5 : 1);
                            const currentBookings = slot.currentBookingsCount || 0;
                            const availablePlaces = slot.availablePlaces ?? (maxCapacity - currentBookings);

                            return (
                                <button
                                    key={slot.id}
                                    disabled={disabled}
                                    title={disabled ? "Za późno na rezerwację (wymagane min. 24h wyprzedzenia)" : ""}
                                    className={`${styles.slotBtn} ${isSelected ? styles.selected : ''} ${disabled ? styles.disabledSlot : ''}`}
                                    onClick={() => !disabled && setSelectedSlot(slot)}
                                    style={disabled ? {
                                        opacity: 0.45,
                                        cursor: 'not-allowed',
                                        backgroundColor: '#e9ecef',
                                        color: '#6c757d',
                                        borderColor: '#ced4da',
                                        textDecoration: 'line-through'
                                    } : {}}
                                >

                                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    {slot.description && (
                                        <span style={{
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            marginTop: '2px',
                                            color: isSelected ? '#ffffff' : '#d28b5b',
                                            fontStyle: 'italic',
                                            fontWeight: '500',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '100%'
                                        }}>
                                            📌 {slot.description}
                                        </span>
                                    )}


                                    {isGroup && !disabled && (
                                        <span style={{
                                            display: 'block',
                                            fontSize: '0.7rem',
                                            marginTop: '4px',
                                            color: isSelected ? '#ffffff' : '#27ae60',
                                            fontWeight: '600'
                                        }}>
                                            {availablePlaces > 0 ? `Wolne miejsca: ${availablePlaces}/${maxCapacity}` : 'Brak miejsc'}
                                        </span>
                                    )}


                                    {disabled && (
                                        <span style={{ display: 'block', fontSize: '0.65rem', textDecoration: 'none', color: '#d9534f' }}>
                                            &lt; 24h
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <p className={styles.statusMsg}>
                            Brak pasujących wolnych terminów na ten dzień.
                        </p>
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.selectionInfo}>
                        <p>Wybrany termin:</p>
                        <strong>{selectedSlot ? new Date(selectedSlot.startTime).toLocaleString() : 'Wybierz godzinę z listy'}</strong>
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