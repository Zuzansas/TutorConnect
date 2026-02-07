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
                extendedProps: { type: 'RESERVATION', isReserved: true, status: res.status }
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

    const handleEventClick = async (clickInfo) => {
        const { type } = clickInfo.event.extendedProps;

        if (type === 'RESERVATION') {
            Swal.fire({
                title: 'Szczegóły rezerwacji',
                html: `<b>Lekcja:</b> ${clickInfo.event.title}<br><b>Czas:</b> ${clickInfo.event.start.toLocaleString()}`,
                icon: 'info',
                confirmButtonColor: '#d28b5b',
                confirmButtonText: 'Zamknij'
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
                } else {
                    toast.error("Nie można usunąć tego slotu");
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