import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './AdminCalendarPage.module.css';

import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminCalendarPage = () => {
    const [events, setEvents] = useState([]);
    const token = localStorage.getItem('accessToken');

    const fetchData = async (start, end) => {
        try {
            const slotsRes = await fetch(
                `http://localhost:8080/api/slots/available?from=${start.toISOString()}&to=${end.toISOString()}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const slotsData = await slotsRes.json();

            const reservationsRes = await fetch(
                `http://localhost:8080/api/reservations`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const reservationsData = await reservationsRes.json();

            const freeSlots = slotsData.map(slot => ({
                id: slot.id,
                start: slot.startTime,
                end: slot.endTime,
                title: 'WOLNY',
                backgroundColor: '#2ecc71',
                textColor: '#ffffff',
                extendedProps: { type: 'SLOT', isReserved: false }
            }));

            const activeReservations = reservationsData.map(res => ({
                id: res.id,
                start: res.startTime,
                end: res.endTime,
                title: `${res.lessonTitle} - ${res.studentName}`,
                backgroundColor: '#d28b5b',
                textColor: '#ffffff',

                extendedProps: {
                    type: 'RESERVATION',
                    isReserved: true,
                    status: res.status,
                    studentEmail: res.studentEmail,
                    studentBio: res.studentBio,
                    studentCity: res.studentCity,
                    studentAvatarUrl: res.studentAvatarUrl
                }
            }));

            setEvents([...freeSlots, ...activeReservations]);
        } catch (error) {
            toast.error("Błąd pobierania danych kalendarza");
        }
    };

    const handleSelect = async (selectInfo) => {
        const result = await Swal.fire({
            title: 'Nowy termin',
            text: `Czy chcesz otworzyć slot: ${selectInfo.start.toLocaleString()}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d28b5b',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Tak, dodaj',
            cancelButtonText: 'Anuluj'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('http://localhost:8080/api/slots', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        startTime: selectInfo.start.toISOString(),
                        endTime: selectInfo.end.toISOString()
                    })
                });
                if (response.ok) {
                    toast.success("Termin został dodany!");
                    fetchData(selectInfo.view.activeStart, selectInfo.view.activeEnd);
                } else {
                    toast.error("Błąd zapisu slotu");
                }
            } catch (error) {
                toast.error("Błąd połączenia z serwerem");
            }
        }
    };
    const handleCancelReservation = async (reservationId) => {
        const result = await Swal.fire({
            title: 'Czy na pewno odwołać?',
            text: "Student zostanie poinformowany o odwołaniu zajęć.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Tak, odwołaj',
            cancelButtonText: 'Wróć'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    toast.success("Rezerwacja została odwołana");
                    // Odświeżamy dane w kalendarzu
                    // Pobieramy aktualny widok z FullCalendar przez API jeśli to możliwe lub po prostu fetchData
                    // Zakładając, że masz dostęp do start/end, wywołujemy fetchData:
                    Swal.close();
                    window.location.reload(); // Najprostszy sposób na pełne odświeżenie stanów
                } else {
                    toast.error("Błąd podczas odwoływania rezerwacji");
                }
            } catch (error) {
                toast.error("Błąd połączenia z serwerem");
            }
        }
    };

    const handleOpenMaterialsModal = async (reservationId) => {
        const { value: formValues } = await Swal.fire({
            title: 'Dodaj materiały do lekcji',
            html: `
            <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
                <label style="font-size: 0.8rem; font-weight: 600; color: #d28b5b;">TYTUŁ MATERIAŁÓW</label>
                <input id="swal-input-title" class="swal2-input" style="margin: 0; width: 100%;" placeholder="np. Notatki z lekcji 1">
                
                <label style="font-size: 0.8rem; font-weight: 600; color: #d28b5b;">OPIS (OPCJONALNIE)</label>
                <textarea id="swal-input-desc" class="swal2-textarea" style="margin: 0; width: 100%;" placeholder="Krótki opis materiałów..."></textarea>
                
                <label style="font-size: 0.8rem; font-weight: 600; color: #d28b5b;">PLIK</label>
                <input type="file" id="swal-input-file" class="swal2-file" style="margin: 0; width: 100%;">
            </div>
        `,
            focusConfirm: false,
            confirmButtonColor: '#d28b5b',
            confirmButtonText: 'Wyślij pliki',
            preConfirm: () => {
                const title = document.getElementById('swal-input-title').value;
                const description = document.getElementById('swal-input-desc').value;
                const file = document.getElementById('swal-input-file').files[0];

                if (!title || !file) {
                    Swal.showValidationMessage('Tytuł i plik są wymagane!');
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
                    toast.success("Materiały zostały wysłane pomyślnie!");
                } else {
                    toast.error("Wystąpił błąd podczas wysyłania pliku.");
                }
            } catch (error) {
                toast.error("Błąd połączenia z serwerem.");
            }
        }
    };

    const handleEventClick = async (clickInfo) => {
        const { type, studentEmail, studentBio, studentCity, studentAvatarUrl } = clickInfo.event.extendedProps;

        if (type === 'RESERVATION') {
            Swal.fire({
                title: `<span style="color: #d28b5b; font-size: 1.2rem; font-weight: 700;">${clickInfo.event.title}</span>`,
                html: `
                <div style="font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; gap: 15px; padding-top: 10px;">
                    
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                        <img src="${studentAvatarUrl || 'https://via.placeholder.com/100?text=Avatar'}" 
                             style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 15px rgba(210, 139, 91, 0.2); border: 2px solid white;">
                        <span style="font-size: 0.8rem; color: #95a5a6; font-weight: 500;">
                            <i class="fas fa-map-marker-alt"></i> ${studentCity || ''}
                        </span>
                    </div>

                    <a href="mailto:${studentEmail}" style="text-decoration: none; color: #3498db; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; background: #e6f4ff; padding: 6px 15px; border-radius: 20px; transition: 0.3s;">
                        <i class="fas fa-envelope"></i> ${studentEmail}
                    </a>

                    <div style="width: 100%; text-align: left; background: #fcfaf8; padding: 15px; border-radius: 12px; border: 1px solid #f1ece8;">
                        <p style="margin: 0 0 5px 0; font-size: 0.75rem; color: #d28b5b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">O studencie</p>
                        <p style="margin: 0; color: #555; font-size: 0.9rem; line-height: 1.5;">
                            ${studentBio || 'Brak opisu użytkownika...'}
                        </p>
                    </div>

                    <div style="font-size: 0.85rem; color: #7f8c8d; background: #f8f9fa; width: 100%; padding: 10px; border-radius: 8px; display: flex; justify-content: center; align-items: center; gap: 8px;">
                        <span> ${clickInfo.event.start.toLocaleDateString()},</span>
                        <span> ${clickInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div style="display: flex; gap: 10px; width: 100%; margin-top: 10px;">
                        <button id="add-materials-btn" style="flex: 1; background: #d28b5b; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s;">
                             Dodaj materiały
                        </button>
                        <button id="cancel-reservation-btn" style="background: #fff; color: #e74c3c; border: 1px solid #ffcfcf; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.3s;">
                             Odwołaj
                        </button>
                    </div>
                </div>
            `,
                showConfirmButton: false,
                showCloseButton: true,
                width: '400px',
                padding: '20px',
                customClass: {
                    popup: styles.swalSoftPopup
                },
                didOpen: () => {

                    document.getElementById('add-materials-btn').onclick = () => {
                        Swal.close();
                        handleOpenMaterialsModal(clickInfo.event.id);
                    };
                    document.getElementById('cancel-reservation-btn').onclick = () => {
                        handleCancelReservation(clickInfo.event.id);
                    };
                }
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Usuwanie terminu',
            text: "Czy na pewno chcesz usunąć ten wolny slot?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Tak, usuń',
            cancelButtonText: 'Anuluj'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:8080/api/slots/${clickInfo.event.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    clickInfo.event.remove();
                    toast.success("Slot usunięty");
                }
            } catch (error) {
                toast.error("Błąd serwera");
            }
        }
    };

    return (
        <div className={styles.adminCalendarContainer}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className={styles.header}>
                <div className={styles.legend}>
                    <span className={styles.legendItem}><div className={styles.boxFree}></div> Wolny slot</span>
                    <span className={styles.legendItem}><div className={styles.boxReserved}></div> Rezerwacja</span>
                </div>
            </div>

            <div className={styles.calendarCard}>
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    locale="pl"
                    selectable={true}
                    events={events}
                    select={handleSelect}
                    eventClick={handleEventClick}
                    datesSet={(dateInfo) => fetchData(dateInfo.start, dateInfo.end)}
                    allDaySlot={false}
                    slotMinTime="07:00:00"
                    slotMaxTime="22:00:00"
                    height="auto"
                />
            </div>
        </div>
    );
};

export default AdminCalendarPage;