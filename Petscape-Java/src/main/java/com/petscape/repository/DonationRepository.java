package com.petscape.repository;

import com.petscape.entity.Donation;
import com.petscape.entity.Donation.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    Optional<Donation> findByStripeSessionId(String stripeSessionId);

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Donation d WHERE d.status = 'COMPLETED'")
    BigDecimal sumCompletedDonations();

    @Query("SELECT COUNT(DISTINCT d.user.id) FROM Donation d WHERE d.status = 'COMPLETED'")
    long countUniqueDonors();

    @Query("SELECT COALESCE(AVG(d.amount), 0) FROM Donation d WHERE d.status = 'COMPLETED'")
    BigDecimal avgDonationAmount();


    @Query("SELECT MONTH(d.createdAt), SUM(d.amount) FROM Donation d " +
            "WHERE d.status = 'COMPLETED' AND YEAR(d.createdAt) = :year " +
            "GROUP BY MONTH(d.createdAt) ORDER BY MONTH(d.createdAt)")
    List<Object[]> sumByMonth(@Param("year") int year);
}
